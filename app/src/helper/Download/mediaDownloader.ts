import { DownloadError } from "@/errors/notifError";
import {
	ISavedVideoPost,
	isVideo,
	SavedContentType,
} from "@/savedContent/ISavedContent";
import { RedditItem } from "@/savedContent/serverInputInterface";
import { ElLoading } from "element-plus";
import { ILoadingInstance } from "element-plus/lib/el-loading/src/loading.type";
import { ISavedImagePost } from "../../savedContent/ISavedContent";
import { fetchMedia } from "../fetchHelper/fetchHelper";
import { notify } from "../notifierHelper";
import {
	cancelController,
	getExt,
	getSizeInfo,
	updateDownloadSpinner,
} from "./helper";

const SPINNER_UPDATE_FREQUENCY = 1000;

export function getItemInfo(
	item: ISavedImagePost | ISavedVideoPost,
): RedditItem {
	return {
		url: item.getMediaUrl(),
		name: item.title,
		needYtdl: isVideo(item) ? item.video.needYtDl : false,
	};
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
			{ url: itemInfo.url, needYtdl: itemInfo.needYtdl },
			cancelController.signal,
		);

		const data = await fetchData(x, downloadIndicator);
		const ext: string = getExt(item) ?? x.headers.get("MediaFormat") ?? "";
		return { blob: data, name: `${itemInfo.name}.${ext}` };
	} catch (err) {
		if ((err as Error).name === "AbortError") {
			downloadIndicator.close();
			notify("Download has been Canceled");
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
	if (!x.ok) {
		downloadIndicator.close();
		throw new DownloadError(`Undefined Response Error`);
	}
	const tmpSize = x.headers.get("MediaSize");
	if (!tmpSize) {
		downloadIndicator.close();
		throw new DownloadError(`Undefined Response Error`);
	}
	downloadIndicator.setText("Downloading ...");
	const fileChunks: Uint8Array[] = [];
	let receivedData = 0;

	let updateSpinner: NodeJS.Timeout;
	function setSpinnerInterval(size: number): NodeJS.Timeout {
		const totalSize = size;
		const sizeInfo = getSizeInfo(totalSize);
		return setInterval(() => {
			updateDownloadSpinner(downloadIndicator, receivedData, sizeInfo);
		}, SPINNER_UPDATE_FREQUENCY);
	}
	if (tmpSize) {
		updateSpinner = setSpinnerInterval(parseInt(tmpSize));
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
