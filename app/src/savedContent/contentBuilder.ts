import { postType } from "@/enum/postType";
import { BadLinkError } from "@/errors/restartError";
import { postOapi } from "@/helper/fetchHelper/fetchHelper";
import { Couple } from "@/helper/fetchHelper/requestArgument";
import {
	ISavedCommentPost,
	ISavedGalleryPost,
	ISavedImagePost,
	ISavedLinkPost,
	ISavedTextPost,
	SavedContentType,
} from "./ISavedContent";
import { RedditRawData } from "./redditDataInterface";
import SavedContent from "./savedContent";

const parser = new DOMParser();
// todo remove all SavedContent type
function decodeHtml(txt: string): string {
	const res = parser.parseFromString(txt, "text/html").documentElement
		.textContent;
	return res || "";
}

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

	/*	const res = await fetch("/api/getHead/", {
		method: "POST",
		body: `url=${cleanURL(url)}`,
		headers: authHeaders,
	}); */
	const res = await postOapi("/api/getHead/", [
		new Couple("url", cleanURL(url)),
	]);

	if (res) {
		// todo to remove
		const txt = res as boolean;
		return txt;
	}
	return false;
}

function cleanFallback(url: string) {
	return url.split("/").slice(0, -1).join("/");
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
	return buildLinkPost(data);
}

function returnVideoMedia({
	// todo remove intermediary
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
	return buildVideoPost(data, {
		externalUrl: cleanURL(url),
		imageLink: cleanURL(getImage(data)),
		needYtDl,
		embeddedUrl: cleanURL(embedString),
	});
}

function buildVideoPost(
	data: RedditRawData,
	{
		externalUrl,
		imageLink,
		needYtDl,
		embeddedUrl,
	}: {
		externalUrl: string;
		imageLink: string;
		needYtDl: boolean;
		embeddedUrl: string;
	},
): SavedContentType {
	const content = new SavedContent(data, postType.VIDEO);
	return {
		...content,
		video: {
			externalUrl: cleanURL(externalUrl),
			needYtDl,
			imageLink: cleanURL(imageLink),
			embeddedUrl: cleanURL(embeddedUrl),
		},
		getMediaUrl: () => externalUrl,
		getImageUrl: () => imageLink,
	};
}
function buildLinkPost(data: RedditRawData): ISavedLinkPost {
	const content = new SavedContent(data, postType.LINK);
	content.type = postType.LINK;
	console.log(data.url_overridden_by_dest);
	console.log(data.link_author);
	console.log(data.link_url);

	if (!data.url_overridden_by_dest) {
		throw new Error();
	}
	return {
		...content,
		link: {
			externalUrl: cleanURL(data.url_overridden_by_dest),
			imageLink: cleanURL(getImage(data)),
		},
	};
}
function buildImagePost(data: RedditRawData): ISavedImagePost {
	const content = new SavedContent(data, postType.IMAGE);
	const url = data.url_overridden_by_dest;
	if (!url) {
		throw new Error();
	}
	return {
		...content,
		image: { imageLink: cleanURL(url) },
		getMediaUrl: () => cleanURL(url),
		getImageUrl: () => cleanURL(url),
	};
}
function buildTextPost(kind: string, data: RedditRawData): ISavedTextPost {
	// todo redo
	const content = new SavedContent(data, postType.TEXT);
	if (!data.selftext || !data.selftext_html) {
		throw new Error();
	}
	return {
		...content,
		text: {
			text: data.selftext,
			htmlText: decodeHtml(data.selftext_html),
		},
	};
}

function buildCommentPost(data: RedditRawData): ISavedCommentPost {
	// todo redo
	const content = new SavedContent(data, postType.COMMENT);
	if (!data.body || !data.body_html || !data.link_author || !data.link_url) {
		throw new Error();
	}
	console.log("***COMMENT");
	return {
		...content,
		comment: {
			text: data.body,
			htmlText: decodeHtml(data.body_html),
			postAuthor: data.link_author,
			postLink: cleanURL(data.link_url),
		},
	};
}

// todo remove intermediary
function buildGalleryPost(data: RedditRawData): ISavedGalleryPost {
	const content = new SavedContent(data, postType.IMAGE); // tocheck type
	const galleryURLs: string[] = [];
	if (data.media_metadata) {
		// tocheck
		Object.keys(data.media_metadata).forEach((el) => {
			galleryURLs.push(cleanURL(`https://i.redd.it/${el}.jpg`));
		});
	}

	return {
		...content,
		gallery: { galleryURLs },
		image: { imageLink: cleanURL(galleryURLs[0]) },
		getMediaUrl: () => cleanURL(galleryURLs[0]),
		getImageUrl: () => cleanURL(galleryURLs[0]),
	};
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
// todo composition
// eslint-disable-next-line max-statements
export async function buildMedia(
	data: RedditRawData,
): Promise<SavedContentType> {
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
		return buildImagePost(data); // tocheck
	}
	if (data.is_gallery === true) {
		return buildGalleryPost(data);
	}
	if (postHint === "rich:video" || postHint === "hosted:video") {
		return getVideoMedia(data);
	}
	if (
		videoExtensionList.some((el) => urlExtension === el) ||
		data?.media?.oembed?.type === "video"
	) {
		if (!data.url_overridden_by_dest) {
			// tocheck
			throw new Error();
		}
		return returnVideoMedia({ url: data.url_overridden_by_dest, data }); // tocheck
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
}): Promise<SavedContentType> {
	console.log("BUILD CONTENT");
	console.log(saved.kind);
	if (saved.kind === "t1") {
		console.log("BUild Comment");
		return buildCommentPost(saved.data);
	}
	if (saved.data.is_self) {
		return buildTextPost(saved.kind, saved.data);
	}
	return buildMedia(saved.data);
}
