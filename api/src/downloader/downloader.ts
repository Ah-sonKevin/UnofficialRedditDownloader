import fetch from "node-fetch";
import {
	isMultiChannel,
	isOneChannel,
	ItemInfo,
	OneChannelItemInfo,
} from "../interface/itemInfo";
import { multiChannelDownload } from "./youtubeDl";

export {}; // todo needed for module with its own scope
require("express-zip");

export async function download(
	item: OneChannelItemInfo,
): Promise<NodeJS.ReadableStream> {
	// tocheck type
	const res = await fetch(item.url);
	if (res.ok) {
		return res.body;
	}
	throw new Error(); // todo
}

// eslint-disable-next-line max-lines-per-function
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
// todo replace throw with next (auto logServer in next)
export function downloader(itemInfo: ItemInfo): Promise<NodeJS.ReadableStream> {
	if (itemInfo.needYoutubeDl) {
		return youtubeDlDownload(itemInfo);
	}
	if (isOneChannel(itemInfo)) {
		return download(itemInfo);
	}
	return Promise.reject(new Error("Invalid download info")); // check structure
}
