import { DownloadError } from "@/errors/notifError";
import {
	isGallery,
	isImage,
	isLink,
	isText,
	isVideo,
	SavedContentType,
} from "@/savedContent/ISavedContent";
import { BatchItem } from "@/savedContent/serverInputInterface";
import { ElLoading } from "element-plus";
import { ILoadingInstance } from "element-plus/lib/el-loading/src/loading.type";
import { fetchMedia } from "../fetchHelper/fetchHelper";
import { notify } from "../notifierHelper";
import { cleanString } from "../stringHelper";
import {
	cancelController,
	exhaustivenessCheck,
	getExt,
	getSizeInfo,
	updateDownloadSpinner,
} from "./helper";

const SPINNER_UPDATE_FREQUENCY = 1000;

export function getItemInfo(item: SavedContentType): BatchItem {
	if (item.isGallery) {
		throw Error("Need Batch Download");
	}
	if (isText(item) || isLink(item)) {
		// todo why use text here ?

		return {
			url: "item.externalUrl",
			name: cleanString(item.title),
			//	ext: "txt",
			folder: "",
			needYtDl: false,
		};
	}
	// todo factorize
	if (isImage(item) || isGallery(item)) {
		return {
			url: item.image.imageLink, // factorize : function getUrl
			name: cleanString(item.title),
			//	ext: "txt",
			folder: "",
			needYtDl: false,
		};
	}
	if (isVideo(item)) {
		return {
			url: item.video.externalUrl,
			name: cleanString(item.title),
			//	ext: item.externalUrl.split(".").slice(-1)[0],
			folder: "",
			needYtDl: item.video.needYtDl,
		};
	}
	return exhaustivenessCheck();
}

export async function downloadMedia(
	item: SavedContentType,
): Promise<{ blob: Blob; name: string }> {
	const downloadIndicator = ElLoading.service({
		fullscreen: true,
		text: "Download Preparation",
		target: "#topArea",
	});
	const itemInfo = getItemInfo(item);

	try {
		const x = await fetchMedia(
			{ url: itemInfo.url, needYtDl: itemInfo.needYtDl },
			cancelController.signal,
		);

		const data = await fetchData(x, downloadIndicator);
		const ext: string = getExt(item) ?? x.headers.get("MediaFormat") ?? ""; // todo check server ??
		return { blob: data, name: `${itemInfo.name}.${ext}` };
	} catch (err) {
		if ((err as Error).name === "AbortError") {
			downloadIndicator.close();
			notify("Download has been Canceled");
			throw new Error();
			// tocheck manage error
		} else {
			throw err;
		}
	}
}

// eslint-disable-next-line max-statements
export async function fetchData(
	x: Response,
	downloadIndicator: ILoadingInstance,
): Promise<Blob> {
	if (x.ok) {
		const tmpSize = x.headers.get("MediaSize");
		downloadIndicator.setText("Downloading ...");
		const fileChunks: Uint8Array[] = [];
		let receivedData = 0;

		let updateSpinner: NodeJS.Timeout;
		if (tmpSize) {
			const totalSize = parseInt(tmpSize);
			const sizeInfo = getSizeInfo(totalSize);
			updateSpinner = setInterval(() => {
				updateDownloadSpinner(downloadIndicator, receivedData, sizeInfo); // tocheck update
			}, SPINNER_UPDATE_FREQUENCY);
		}

		const endDownload = () => {
			downloadIndicator.close();
			if (updateSpinner) {
				clearInterval(updateSpinner);
			}
		};

		const reader = x.body?.getReader();
		if (!reader) {
			downloadIndicator.close();
			throw new DownloadError(`Undefined Reader error `);
		}
		let reading = true;

		// eslint-disable-next-line no-loops/no-loops
		while (reading) {
			// eslint-disable-next-line no-await-in-loop
			const { done, value } = await reader.read();
			if (done) {
				reading = false;
			} else {
				if (!value) {
					endDownload();
					throw new DownloadError(`Undefined Value Error`);
				}
				fileChunks.push(value);
				receivedData += value.length;
			}
		}

		endDownload();
		return new Blob(fileChunks);
	}
	downloadIndicator.close();
	throw new DownloadError(`Undefined Response Error`);
}
