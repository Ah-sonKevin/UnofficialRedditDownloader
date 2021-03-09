// change video interface to add IImage

import { PostType } from "../../enum/postType";
import { ISavedVideoPost } from "../ISavedContent";
import { RedditRawData } from "../redditDataInterface";
import SavedContent from "../savedContent";
import { cleanURL, getImage } from "./helper";

export async function isDownloadable(url: string): Promise<boolean> {
	// tocheck
	const authHeaders = new Headers();
	authHeaders.append("Content-Type", "application/json");
	const res = await fetch("/api/getHead/", {
		// tocheck
		method: "POST",
		body: `{ url': ${cleanURL(url)} }`,
		headers: authHeaders,
	});

	if (res) {
		const txt = (await res.json()) as boolean;
		console.log(res);
		return txt;
	}
	return false;
}

export function cleanFallback(url: string): string {
	return url.split("/").slice(0, -1).join("/");
}

export function getEmbed(data: RedditRawData): string {
	if (data?.media_embed?.content) {
		return data?.media_embed?.content;
	}
	if (data?.media?.oembed?.html) {
		return data?.media?.oembed?.html;
	}
	return "";
}

export function returnVideoMedia({
	url,
	data,
	needYtDl = false,
	embed,
}: {
	url: string;
	data: RedditRawData;
	needYtDl?: boolean;
	embed?: string;
}): ISavedVideoPost {
	const embedString = embed ?? getEmbed(data);
	return buildVideoPost(data, {
		externalUrl: cleanURL(url),
		imageLink: cleanURL(getImage(data)),
		needYtDl,
		embeddedUrl: embedString, // tocheck toremember no need cleanURL for embed
	});
}

export function buildVideoPost(
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
): ISavedVideoPost {
	const content = new SavedContent(data, PostType.VIDEO);
	return {
		...content,
		video: {
			externalUrl: cleanURL(externalUrl),
			needYtDl,
			imageLink: cleanURL(imageLink),
			embeddedUrl,
		},
		getMediaUrl: () => externalUrl,
		getImageUrl: () => imageLink,
	};
}

export function getVideoMedia(data: RedditRawData): ISavedVideoPost {
	if (
		(data.domain === "youtube.com" || data.domain === "youtu.be") &&
		data.url_overridden_by_dest
	) {
		return returnVideoMedia({
			url: data.url_overridden_by_dest,
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
		return returnVideoMedia({
			url: data.media.oembed.thumbnail_url,
			data,
			embed: data?.media?.oembed?.html ?? "",
		});
	}
	if (!data.url_overridden_by_dest) {
		throw new Error("INVALID POST: MISSING URL");
	}
	return returnVideoMedia({
		url: data.url_overridden_by_dest,
		data,
		needYtDl: true,
	});
}
