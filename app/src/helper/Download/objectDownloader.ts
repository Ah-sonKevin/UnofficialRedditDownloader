import { postType } from "@/enum/postType";
import { DownloadError, PartialDownloadError } from "@/errors/notifError";
import { NetworkError, UnknowTypeError } from "@/errors/restartError";
import { ItemInfo, SuccessList } from "@/savedContent/ItemInterface";
import { ElLoading } from "element-plus";
import { ILoadingInstance } from "element-plus/lib/el-loading/src/loading.type";
import JSZip, { loadAsync } from "jszip";
import {
	ISavedTextPost,
	isGallery,
	isImage,
	isLink,
	isText,
	isVideo,
	SavedContentType,
} from "../../savedContent/ISavedContent";
import { BatchItem } from "../../savedContent/serverInputInterface";
import { fetchBatchMediaInfo, fetchMedia } from "../fetchHelper/fetchHelper";
import { notify } from "../notifierHelper";
import { cleanString } from "../stringHelper";

const cancelController = new AbortController();
const SPINNER_UPDATE_FREQUENCY = 1000;
const suffixList = ["B", "KiB", "MiB", "GiB"];
const SIZE_RATIO = 1024;
const SIZE_DECIMAL_PRECISION = 2;

export function cancelDownload(): void {
	cancelController.abort();
}
// todo test hover
// todo test notif
// todo test download a part
// todo test throw error
function getName(text: string, extension: string): string {
	return `${text}.${extension}`;
}
function getText(item: ISavedTextPost): string {
	const parser = new DOMParser();

	const parsedContent = parser.parseFromString(item.text.htmlText, "text/html"); // tocheck
	const stringContent = parsedContent.documentElement.textContent;

	let res = "";
	if (item.type === postType.COMMENT) {
		res = `${item.redditUrl} \n\n A comment  by '${item.author}' of the post '${
			item.title
		}' by '${item.author}' from
         ${item.subreddit} at ${item.redditUrl} \n\n\n\n ${
			stringContent ?? ""
		}`;
	} else {
		res = `${item.redditUrl} \n\n ${item.title} by '${item.author}' from ${
			item.subreddit
		} at ${item.redditUrl} \n\n\n\n ${stringContent ?? ""}`;
	}
	return res;
}

function downloadPageAsText(item: ISavedTextPost): void {
	const res = getText(item);
	downloadObject(new Blob([res]), getName(item.title, "html"));
}

function getSizeInfo(totalSize: number) {
	let multiple = 0;
	while (totalSize > SIZE_RATIO) {
		totalSize /= SIZE_RATIO;
		multiple += 1;
	}
	return {
		suffix: suffixList[multiple],
		divider: SIZE_RATIO ** multiple,
		size: 1 + totalSize / SIZE_RATIO,
	};
}

function updateDownloadSpinner(
	downloadIndicator: ILoadingInstance,
	receivedData: number,
	{ size, divider, suffix }: { size: number; divider: number; suffix: string },
) {
	downloadIndicator.setText(
		`Downloading : ${(receivedData / divider).toFixed(
			SIZE_DECIMAL_PRECISION,
		)}/${size.toFixed(SIZE_DECIMAL_PRECISION)} ${suffix}`,
	);
}

// eslint-disable-next-line max-statements
async function fetchData(
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

async function downloadMedia(item: SavedContentType) {
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
		downloadObject(data, `${itemInfo.name}.${ext}`);
	} catch (err) {
		if ((err as Error).name === "AbortError") {
			downloadIndicator.close();
			notify("Download has been Canceled");
		} else {
			throw err;
		}
	}
}

export function downloadObject(object: Blob, nom: string): void {
	const img = URL.createObjectURL(object);
	const linkDown = document.createElement("a");
	linkDown.href = img;
	linkDown.setAttribute("download", nom);
	linkDown.click();
	linkDown.remove();
	URL.revokeObjectURL(img);
}

function getItemInfo(item: SavedContentType): BatchItem {
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
function exhaustivenessCheck(): never {
	throw new Error();
}
function getExt(item: SavedContentType): string {
	if (isText(item) || isLink(item)) {
		// tocheck isLink
		return "txt";
	}
	if (isVideo(item) || isImage(item) || isGallery(item)) {
		// todo check type
		return item.getMediaUrl().split(".").slice(-1)[0];
	}
	return exhaustivenessCheck();
}

function batchGetItemInfo(item: SavedContentType): ItemInfo[] {
	// todo rename
	// todo tocheck type received on server after parser string / boolean
	if (isGallery(item)) {
		return item.gallery.galleryURLs.map((el, index) => ({
			// tocheck other function for image ?
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

export function download(items: SavedContentType | SavedContentType[]): void {
	if (Array.isArray(items)) {
		if (items.length === 1) {
			void singleDownload(items[0]);
		} else {
			void batchDownload(items);
		}
	} else {
		void singleDownload(items);
	}
}

export async function batchDownload(items: SavedContentType[]): Promise<void> {
	const medias: SavedContentType[] = [];
	const texts: ISavedTextPost[] = [];
	items.forEach((item) => {
		if (item.hasImage) {
			medias.push(item);
		} else if (isText(item)) {
			texts.push(item);
		} else {
			throw new Error();
		}
	});
	const textContents = texts.map((el) => ({
		name: getName(el.title, "txt"),
		content: getText(el),
	}));

	const archive = await getMediaArchive(medias);
	textContents.forEach((el) => {
		archive.file(el.name, el.content);
	});
	const zip = await archive.generateAsync({ type: "uint8array" });
	downloadObject(new Blob([zip]), getName("archive", "zip"));
}

async function getMediaArchive(items: SavedContentType[]): Promise<JSZip> {
	if (items.length > 0) {
		const blob = await batchDownloadMedia(items);
		if (blob) {
			return loadAsync(blob);
		}
	}
	return new JSZip();
}

function checkForPartialDownloadError(blob: Blob) {
	void loadAsync(blob)
		.then((el) => el.files["result.json"].async("string"))
		.then((res) => {
			const arrays = JSON.parse(res) as SuccessList;
			if (arrays.fail.length > 0) {
				throw new PartialDownloadError(arrays); // tocheck
			}
			return arrays;
		});
}
async function batchDownloadMedia(
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

export async function singleDownload(item: SavedContentType): Promise<void> {
	const itemType: string = item.type;
	if (item.isGallery) {
		await batchDownload([item]);
	} else if (
		// tocheck link has text ?
		isText(item) // ||
		// tocheck isLink(item)
		/*	itemType === postType.TEXT ||
		itemType === postType.LINK ||
		itemType === postType.COMMENT */
	) {
		downloadPageAsText(item);
	} else if (itemType === postType.IMAGE || itemType === postType.VIDEO) {
		await downloadMedia(item);
	} else {
		throw new UnknowTypeError(`Unknow type ${itemType}  ${item.title}`);
	}
}
