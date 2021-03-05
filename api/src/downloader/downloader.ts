import fetch from "node-fetch";
import { DownloadError } from "../../../app/src/errors/notifError";
import {
	isMultiChannel,
	isOneChannel,
	ItemInfo,
	OneChannelItemInfo,
} from "../interface/itemInfo";
import { multiChannelDownload } from "./youtubeDl";

require("express-zip");

export async function download(
	item: OneChannelItemInfo,
): Promise<NodeJS.ReadableStream> {
	const res = await fetch(item.url);
	if (res.ok) {
		return res.body;
	}
	throw new DownloadError("Download failed");
}

export async function youtubeDlDownload(
	itemInfo: ItemInfo,
): Promise<NodeJS.ReadableStream> {
	if (isOneChannel(itemInfo)) {
		return download(itemInfo);
	}
	if (isMultiChannel(itemInfo)) {
		return multiChannelDownload(itemInfo);
	}
	throw new Error("Invalid item info");
}
export function downloader(itemInfo: ItemInfo): Promise<NodeJS.ReadableStream> {
	if (itemInfo.needYoutubeDl) {
		return youtubeDlDownload(itemInfo);
	}
	if (isOneChannel(itemInfo)) {
		return download(itemInfo);
	}
	return Promise.reject(new Error("Invalid download info")); // check structure
}
