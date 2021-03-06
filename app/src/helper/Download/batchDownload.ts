import { PartialDownloadError } from "@/errors/notifError";
import { NetworkError } from "@/errors/restartError";
import {
	isGallery,
	Media,
	SavedContentType,
} from "@/savedContent/ISavedContent";
import { SuccessList } from "@/savedContent/ItemInterface";
import { RedditItem } from "@/savedContent/serverInputInterface";
import { ElLoading } from "element-plus";
import JSZip, { loadAsync } from "jszip";
import { fetchBatchMediaInfo } from "../fetchHelper/fetchHelper";
import { notify } from "../notifierHelper";
import { cleanString } from "../stringHelper";
import { cancelController, getName } from "./helper";
import { fetchData, getItemInfo } from "./mediaDownloader";

function batchGetItemInfo(item: SavedContentType & Media): RedditItem[] {
	// tocheck type
	if (isGallery(item)) {
		const title = cleanString(item.title);
		return item.gallery.galleryURLs.map((el, index) => ({
			url: el,
			name: `${title}/${getName(
				`${title}_${String(index + 1)}`,
				el.split(".").slice(-1)[0],
			)}`,
			needYtdl: false,
		}));
	}
	return [getItemInfo(item)];
}

export async function getMediaArchive(
	items: (SavedContentType & Media)[], // tocheck type
): Promise<JSZip> {
	if (items.length > 0) {
		const blob = await batchDownloadMedia(items);
		if (blob) {
			return loadAsync(blob);
		}
	}
	return new JSZip();
}

export async function batchDownloadMedia(
	items: (SavedContentType & Media)[], // tocheck type
): Promise<Blob | null> {
	const downloadIndicator = ElLoading.service({
		fullscreen: true,
		text: "Download Preparation",
		target: "#topArea",
	});

	const urls: RedditItem[] = [];
	items.forEach((el) => {
		urls.push(...batchGetItemInfo(el));
	});

	try {
		const x = await fetchBatchMediaInfo(urls, cancelController.signal);
		const blob = await fetchData(x, downloadIndicator);
		if (blob) {
			checkForPartialDownloadError(blob);
			return blob;
		}
		throw new NetworkError(x.statusText);
	} catch (err) {
		if ((err as Error).name === "AbortError") {
			downloadIndicator.close();
			notify("Download has been Canceled");
			return null;
		}
		throw err;
	}
}

function checkForPartialDownloadError(blob: Blob) {
	void loadAsync(blob)
		.then((el) => el.files["result.json"].async("string"))
		.then((res) => {
			const arrays = JSON.parse(res) as SuccessList;
			if (arrays.fail.length > 0) {
				throw new PartialDownloadError(arrays); // tocheckonrun check display error
			}
			return arrays;
		});
}
