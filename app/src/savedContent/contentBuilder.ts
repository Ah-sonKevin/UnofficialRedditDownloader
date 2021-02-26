import { postType } from "@/enum/postType";
import { BadLinkError } from "@/errors/restartError";
import { RedditRawData } from "./redditDataInterface";
import SavedContent from "./savedContent";

const parser = new DOMParser();

function cleanURL(url: string): string {
	if (url === "") {
		return url;
	}
	const res = parser.parseFromString(url, "text/html").documentElement
		.textContent;
	if (!res) {
		throw new BadLinkError(`Cleaning URL Error  ${url}`);
	}
	return res;
}

async function isDownloadable(url: string): Promise<boolean> {
	const authHeaders = new Headers();
	authHeaders.append("Content-Type", "application/x-www-form-urlencoded");

	const res = await fetch("/api/getHead/", {
		method: "POST",
		body: `url=${cleanURL(url)}`,
		headers: authHeaders,
	});
	if (res.ok) {
		const txt = (await res.json()) as boolean;
		return txt;
	}
	return false;
}

function cleanFallback(url: string) {
	return url.split("/").slice(0, -1).join("/");
}
// later use composition & object literal

// eslint-disable-next-line max-params
function returnMedia(
	type: string,
	externalUrl: string,
	imageLink: string,
	needYtDl = false,
	embeddedUrl = "",
): {
	type: string;
	externalUrl: string;
	imageLink: string;
	needYtDl: boolean;
	embeddedUrl: string;
} {
	return {
		type,
		imageLink: cleanURL(imageLink),
		externalUrl: cleanURL(externalUrl),
		needYtDl,
		embeddedUrl: cleanURL(embeddedUrl),
	};
}

function getExtension(url: string): string {
	const urlExtension = url.split(".").slice(-1)[0];
	if (urlExtension[urlExtension.length - 1] === "/") {
		urlExtension.slice(0, urlExtension.length - 1);
	}
	return urlExtension;
}
const webExtensionsList = [
	"html",
	"org",
	"fr",
	"net",
	"co",
	"us",
	"uk",
	"io",
	"gov",
	"gouv",
	"info",
	"biz",
];
const imageExtensionList = ["jpg", "jpeg", "png", "gif"];
const videoExtensionList = ["mp4", "gifv"];

function getImage(data: RedditRawData): string {
	const previewImage = data?.preview?.images;
	if (previewImage) {
		const tempImage = previewImage[0]?.source?.url;
		if (tempImage) {
			return tempImage;
		}
	}
	const tempImage2 = data?.media?.oembed?.thumbnail_url;
	if (tempImage2) {
		return tempImage2;
	}
	return "";
}

function getEmbed(data: RedditRawData): string {
	if (data?.media_embed?.content) {
		return data?.media_embed?.content;
	}
	if (data?.media?.oembed?.html) {
		return data?.media?.oembed?.html;
	}
	return "";
}
function returnLinkMedia(data: RedditRawData) {
	// todo need getImage ?
	return returnMedia(
		postType.LINK,
		data.url_overridden_by_dest ?? "", // tocheck
		getImage(data),
	);
}

function returnImageMedia(url: string) {
	return returnMedia(postType.IMAGE, url, url, false);
}
function returnVideoMedia({
	url,
	data,
	needYtDl = false,
	embed,
}: {
	url: string;
	data: RedditRawData;
	needYtDl?: boolean;
	embed?: string;
}) {
	const embedString = embed ?? getEmbed(data);
	return returnMedia(
		postType.VIDEO,
		url,
		getImage(data),
		needYtDl,
		embedString,
	);
}

function getVideoMedia(data: RedditRawData) {
	if (data.domain === "youtube.com" || data.domain === "youtu.be") {
		return returnVideoMedia({
			url: data.url_overridden_by_dest ?? "", // tocheck
			data,
			needYtDl: true,
		});
	}
	if (data.is_reddit_media_domain && data?.media?.reddit_video?.fallback_url) {
		return returnVideoMedia({
			url: cleanFallback(data?.media?.reddit_video?.fallback_url),
			data,
			needYtDl: true,
			embed: data?.media?.reddit_video?.fallback_url,
		});
	}
	if (data?.media?.oembed?.thumbnail_url) {
		let embed = "";
		if (data?.media?.oembed?.html) {
			embed = data?.media?.oembed?.html; // todo check embed
		}

		return returnVideoMedia({
			url: data.media.oembed.thumbnail_url,
			data,
			embed,
		});
	}
	return returnVideoMedia({
		url: data.url_overridden_by_dest ?? "", // tocheck
		data,
		needYtDl: true,
	});
}

// eslint-disable-next-line max-statements
export async function buildMedia(
	data: RedditRawData,
): Promise<{
	type: string;
	externalUrl: string;
	imageLink: string;
	needYtDl: boolean;
	embeddedUrl: string;
}> {
	const postHint = data.post_hint;
	let urlExtension = "";

	if (data.url_overridden_by_dest) {
		urlExtension = getExtension(data.url_overridden_by_dest);
	}

	if (postHint === "link") {
		const parentList = data.crosspost_parent_list;
		if (parentList && parentList[0]) {
			return buildMedia(parentList[0]);
		}
		return returnLinkMedia(data);
	}
	if (webExtensionsList.some((el) => urlExtension === el)) {
		return returnLinkMedia(data);
	}
	if (
		postHint === "image" ||
		imageExtensionList.some((el) => urlExtension === el)
	) {
		return returnImageMedia(data.url_overridden_by_dest ?? ""); // tocheck
	}
	if (data.is_gallery === true) {
		return returnImageMedia("");
	}
	if (postHint === "rich:video" || postHint === "hosted:video") {
		return getVideoMedia(data);
	}
	if (
		videoExtensionList.some((el) => urlExtension === el) ||
		data?.media?.oembed?.type === "video"
	) {
		return returnVideoMedia({ url: data.url_overridden_by_dest ?? "", data }); // tocheck
	}
	const fallback = // todo check embed of those url
		data.preview?.reddit_video_preview?.fallback_url ??
		data?.media?.reddit_video?.fallback_url;
	if (fallback) {
		return returnVideoMedia({
			url: cleanFallback(fallback),
			data,
			needYtDl: true,
			embed: fallback,
		});
	}
	const isDown = await isDownloadable(data.url_overridden_by_dest ?? ""); // tocheck
	if (isDown) {
		return returnVideoMedia({
			url: data.url_overridden_by_dest ?? "", // tocheck
			data,
			needYtDl: true,
		});
	}
	return returnLinkMedia(data);
}
// todo to refactor
export async function buildContent(saved: {
	kind: string;
	data: RedditRawData;
}): Promise<SavedContent> {
	if (saved.kind === "t1" || saved.data.is_self) {
		return new SavedContent(saved.kind, saved.data, "", "", "", "", false);
	}
	const media = await buildMedia(saved.data);
	return new SavedContent(
		saved.kind,
		saved.data,
		media.externalUrl,
		media.imageLink,
		media.type,
		media.embeddedUrl,
		media.needYtDl,
	);
}
