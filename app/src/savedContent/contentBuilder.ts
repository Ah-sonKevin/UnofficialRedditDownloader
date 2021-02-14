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
	const tempImage = data.preview?.images[0]?.source?.url;
	if (tempImage) {
		return tempImage;
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

	/** ****************** LINK  *************************** */
	if (postHint === "link") {
		const parentList = data.crosspost_parent_list;
		if (parentList && parentList[0]) {
			return buildMedia(parentList[0]);
		}
		return returnMedia(
			postType.LINK,
			data.url_overridden_by_dest,
			getImage(data),
		);
	}
	if (webExtensionsList.some((el) => urlExtension === el)) {
		return returnMedia(
			postType.LINK,
			data.url_overridden_by_dest,
			getImage(data),
		);
	}
	if (
		postHint === "image" ||
		imageExtensionList.some((el) => urlExtension === el)
	) {
		return returnMedia(
			postType.IMAGE,
			data.url_overridden_by_dest,
			data.url_overridden_by_dest,
			false,
		);
	}
	if (postHint === "rich:video" || postHint === "hosted:video") {
		if (data.domain === "youtube.com" || data.domain === "youtu.be") {
			return returnMedia(
				postType.VIDEO,
				data.url_overridden_by_dest,
				getImage(data),
				true,
				getEmbed(data),
			);
		}
		if (
			data.is_reddit_media_domain &&
			data?.media?.reddit_video?.fallback_url
		) {
			return returnMedia(
				postType.VIDEO,
				cleanFallback(data?.media?.reddit_video?.fallback_url),
				getImage(data),
				true,
				data?.media?.reddit_video?.fallback_url,
			);
		}
		if (data?.media?.oembed?.thumbnail_url) {
			let embed = "";
			if (data?.media?.oembed?.html) {
				embed = data?.media?.oembed?.html;
			}

			return returnMedia(
				postType.VIDEO,
				data.media.oembed.thumbnail_url,
				getImage(data),
				false,
				embed,
			);
		}
		return returnMedia(
			postType.VIDEO,
			data.url_overridden_by_dest,
			getImage(data),
			true,
			getEmbed(data),
		);
	}
	if (
		videoExtensionList.some((el) => urlExtension === el) ||
		data?.media?.oembed?.type === "video"
	) {
		return returnMedia(
			postType.VIDEO,
			data.url_overridden_by_dest,
			getImage(data),
			false,
			getEmbed(data),
		);
	}
	const fallback = data.preview?.reddit_video_preview?.fallback_url;
	if (fallback) {
		return returnMedia(
			postType.VIDEO,
			cleanFallback(fallback),
			getImage(data),
			true,
			fallback,
		);
	}
	if (data?.media?.reddit_video?.fallback_url) {
		return returnMedia(
			postType.VIDEO,
			cleanFallback(data?.media?.reddit_video?.fallback_url),
			getImage(data),
			true,
			data?.media?.reddit_video?.fallback_url,
		);
	}
	const isDown = await isDownloadable(data.url_overridden_by_dest);
	if (isDown) {
		return returnMedia(
			postType.VIDEO,
			data.url_overridden_by_dest,
			getImage(data),
			true,
		);
	}
	return returnMedia(
		postType.LINK,
		data.url_overridden_by_dest,
		getImage(data),
	);
}

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
