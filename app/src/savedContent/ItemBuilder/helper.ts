import { BadLinkError } from "@/errors/restartError";
import { RedditRawData } from "../redditDataInterface";

const parser = new DOMParser();
export function decodeHtml(txt: string): string {
	const res = parser.parseFromString(txt, "text/html").documentElement
		.textContent;
	return res || "";
}

export function cleanURL(url: string): string {
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
// tocheck remove '??' and '""' (empty)
export function getImage(data: RedditRawData): string {
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
// tocheck structure, need helper ?

export function getExtension(url: string): string {
	const urlExtension = url.split(".").slice(-1)[0];
	if (urlExtension[urlExtension.length - 1] === "/") {
		urlExtension.slice(0, urlExtension.length - 1);
	}
	return urlExtension;
}

export function clearText(text: string): string {
	return text.replace(/\n\n/g, "\n");
}

// tocheck need helper ?
