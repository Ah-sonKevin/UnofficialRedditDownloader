// change video interface to add IImage

import { postType } from "@/enum/postType";
import { postOapi } from "@/helper/fetchHelper/fetchHelper";
import { Couple } from "@/helper/fetchHelper/requestArgument";
import { SavedContentType } from "../ISavedContent";
import { RedditRawData } from "../redditDataInterface";
import SavedContent from "../savedContent";
import { cleanURL, getImage } from "./helper";

export async function isDownloadable(url: string): Promise<boolean> {
	const authHeaders = new Headers();
	authHeaders.append("Content-Type", "application/x-www-form-urlencoded");
	// tocheck
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

export function cleanFallback(url: string) {
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

export function getVideoMedia(data: RedditRawData) {
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
