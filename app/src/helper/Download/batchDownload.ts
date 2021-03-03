import { PartialDownloadError } from "@/errors/notifError";
import { NetworkError } from "@/errors/restartError";
import { isGallery, SavedContentType } from "@/savedContent/ISavedContent";
import { SuccessList } from "@/savedContent/ItemInterface";
import { BatchItem } from "@/savedContent/serverInputInterface";
import { ElLoading } from "element-plus";
import JSZip, { loadAsync } from "jszip";
import { fetchBatchMediaInfo } from "../fetchHelper/fetchHelper";
import { notify } from "../notifierHelper";
import { cleanString } from "../stringHelper";
import { cancelController, getName } from "./helper";
import { fetchData, getItemInfo } from "./mediaDownloader";

function batchGetItemInfo(item: SavedContentType): BatchItem[] {
	// tocheck : redo / separate gallery ? /rename
	if (isGallery(item)) {
		return item.gallery.galleryURLs.map((el, index) => ({
			url: el,
			name: getName(
				`${item.title}_${String(index + 1)}`,
				el.split(".").slice(-1)[0],
			),
			folder: cleanString(item.title),
			needYtDl: false,
		}));
	}
	return [getItemInfo(item)];
}

export async function getMediaArchive(
	items: SavedContentType[],
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
	items: SavedContentType[],
): Promise<Blob | null> {
	const downloadIndicator = ElLoading.service({
		fullscreen: true,
		text: "Download Preparation",
		target: "#topArea",
	});

	const urls: BatchItem[] = [];
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
				throw new PartialDownloadError(arrays); // todo check affichage error
			}
			return arrays;
		});
}
