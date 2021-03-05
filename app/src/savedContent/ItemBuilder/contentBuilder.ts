import { SavedContentType } from "../ISavedContent";
import { RedditRawData } from "../redditDataInterface";
import { buildCommentPost } from "./commentBuilder";
import { buildGalleryPost } from "./galleryBuilder";
import { getExtension } from "./helper";
import { buildImagePost } from "./imageBuilder";
import { buildLinkPost } from "./linkBuilder";
import { buildTextPost } from "./textBuilder";
import {
	cleanFallback,
	getVideoMedia,
	isDownloadable,
	returnVideoMedia,
} from "./videoBuilder";

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
// tocheck getEmbed
// eslint-disable-next-line max-statements
export async function buildMedia(
	data: RedditRawData,
): Promise<SavedContentType> {
	const postHint = data.post_hint;
	const urlExtension = data.url_overridden_by_dest
		? getExtension(data.url_overridden_by_dest)
		: "";

	if (
		postHint === "link" ||
		webExtensionsList.some((el) => urlExtension === el)
	) {
		const parentList = data.crosspost_parent_list;
		if (parentList && parentList[0]) {
			return buildMedia(parentList[0]);
		}
		return buildLinkPost(data);
	}
	if (
		postHint === "image" || // tocheck posthint for galleries
		imageExtensionList.some((el) => urlExtension === el)
	) {
		return buildImagePost(data);
	}
	if (data.is_gallery === true) {
		return buildGalleryPost(data);
	}
	if (postHint === "rich:video" || postHint === "hosted:video") {
		return getVideoMedia(data);
	}
	if (
		data.url_overridden_by_dest &&
		(videoExtensionList.some((el) => urlExtension === el) ||
			data?.media?.oembed?.type === "video")
	) {
		return returnVideoMedia({ url: data.url_overridden_by_dest, data }); // tocheck  type undefined
	}
	// tocheck embed url needed or just normal url and <video>
	const fallback =
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
	if (data.url_overridden_by_dest) {
		const isDown = await isDownloadable(data.url_overridden_by_dest);
		if (isDown) {
			return returnVideoMedia({
				url: data.url_overridden_by_dest,
				data,
				needYtDl: true,
			});
		}
	}
	return buildLinkPost(data);
}

export async function buildContent(saved: {
	kind: string;
	data: RedditRawData;
}): Promise<SavedContentType> {
	if (saved.kind === "t1") {
		return buildCommentPost(saved.data);
	}
	if (saved.data.is_self) {
		return buildTextPost(saved.kind, saved.data);
	}
	return buildMedia(saved.data);
}
