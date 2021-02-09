import { postType } from "@/enum/postType";
import { PartialDownloadError } from "@/errors/notifError";
import {
	DownloadError,
	NetworkError,
	UnknowTypeError,
} from "@/errors/restartError";
import { ItemInfo, SuccessList } from "@/savedContent/ItemInterface";
import SavedContent from "@/savedContent/savedContent";
import { ElLoading } from "element-plus";
import { ILoadingInstance } from "element-plus/lib/el-loading/src/loading.type";
import JSZip, { loadAsync } from "jszip";
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

function getName(text: string, extension: string): string {
	return `${text}.${extension}`;
}
// tocheck lint staged

function getText(item: SavedContent): string {
	const parser = new DOMParser();

	const parsedContent = parser.parseFromString(item.htmlText, "text/html");
	const stringContent = parsedContent.documentElement.textContent;

	let res = "";
	if (item.type === postType.COMMENT) {
		res = `A comment  by '${item.author}' of the post '${item.title}' by '${
			item.author
		}' from
         ${item.subreddit} at ${item.redditUrl} \n\n\n\n ${stringContent ??
			""}`;
	} else {
		res = `'${item.title}' by '${item.author}' from ${item.subreddit} at ${
			item.redditUrl
		} \n\n\n\n ${stringContent ?? ""}`;
	}
	return res;
}

function downloadPageAsText(item: SavedContent): void {
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

async function fetchData(
	x: Response,
	downloadIndicator: ILoadingInstance,
): Promise<Blob> {
	if (x.ok) {
		const tmpSize = x.headers.get("MediaSize");
		downloadIndicator.setText("Downloading ...");
		const fileChunks: Uint8Array[] = [];
		let receivedData = 0;

		let updateSpinner;
		if (tmpSize) {
			const totalSize = parseInt(tmpSize);
			const sizeInfo = getSizeInfo(totalSize);
			updateSpinner = setInterval(() => {
				updateDownloadSpinner(downloadIndicator, receivedData, sizeInfo);
			}, SPINNER_UPDATE_FREQUENCY);
		}

		const reader = x.body?.getReader();
		if (!reader) {
			downloadIndicator.close();
			throw new DownloadError(`Undefined Reader error `);
		}
		let reading = true;

		// eslint-disable-next-line no-loops/no-loops
		while (reading) {
			// replace no for loop
			// eslint-disable-next-line no-await-in-loop
			const { done, value } = await reader.read();
			if (done) {
				reading = false;
			} else {
				if (!value) {
					downloadIndicator.close();
					throw new DownloadError(`Undefined Value Error`);
				}
				fileChunks.push(value);
				receivedData += value.length;
			}
		}

		downloadIndicator.close();
		if (updateSpinner) {
			clearInterval(updateSpinner);
		}
		return new Blob(fileChunks);
	}
	downloadIndicator.close();
	throw new DownloadError(`Undefined Response Error`);
}

async function downloadMedia(item: SavedContent) {
	const downloadIndicator = ElLoading.service({
		fullscreen: true,
		text: "Download Preparation",
		target: "#topArea",
	});
	const itemInfo = getItemInfo(item);

	try {
		const x = await fetchMedia(
			itemInfo.url,
			itemInfo.needYtDl,
			cancelController.signal,
		);
		const data = await fetchData(x, downloadIndicator);
		downloadObject(data, itemInfo.name);
	} catch (err) {
		if ((err as Error).name === "AbortError") {
			downloadIndicator.close();
			notify("Download has been Canceled");
		} else {
			throw err;
		}
	}
}

function downloadObject(object: Blob, nom: string): void {
	const img = URL.createObjectURL(object);
	const linkDown = document.createElement("a");
	linkDown.href = img;
	linkDown.setAttribute("download", nom);
	linkDown.click();
	linkDown.remove();
	URL.revokeObjectURL(img);
}

function getItemInfo(
	item: SavedContent,
): {
	url: string;
	name: string;
	needYtDl: boolean;
	folder: string;
	ext: string;
} {
	if (item.isGallery) {
		throw Error("Need Batch Download");
	}
	if (
		item.type === postType.COMMENT ||
		item.type === postType.TEXT ||
		item.type === postType.LINK
	) {
		return {
			url: item.externalUrl,
			name: cleanString(item.title),
			ext: "txt",
			folder: "",
			needYtDl: false,
		};
	}
	return {
		url: item.externalUrl,
		name: cleanString(item.title),
		ext: item.externalUrl.split(".").slice(-1)[0],
		folder: "",
		needYtDl: item.needYtDl,
	};
}

function batchGetItemInfo(item: SavedContent): ItemInfo[] {
	if (item.isGallery) {
		return item.galleryURLs.map((el, index) => {
			return {
				url: el,
				name: getName(
					`${item.title}_${String(index + 1)}`,
					el.split(".").slice(-1)[0],
				),
				folder: cleanString(item.title),
				needYtDl: item.needYtDl,
			};
		});
	}
	return [getItemInfo(item)];
}

export function download(items: SavedContent | SavedContent[]): void {
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

export async function batchDownload(items: SavedContent[]): Promise<void> {
	const medias: SavedContent[] = [];
	const texts: SavedContent[] = [];
	items.forEach(item => {
		if (item.hasImage) {
			medias.push(item);
		} else {
			texts.push(item);
		}
	});
	const textContents = texts.map(el => ({
		name: getName(el.title, "txt"),
		content: getText(el),
	}));

	const archive = await getMediaArchive(medias);
	textContents.forEach(el => {
		archive.file(el.name, el.content);
	});
	const zip = await archive.generateAsync({ type: "uint8array" });
	downloadObject(new Blob([zip]), "archive");
}

async function getMediaArchive(items: SavedContent[]): Promise<JSZip> {
	if (items.length > 0) {
		const blob = await batchDownloadMedia(items);
		if (blob) {
			return loadAsync(blob);
		}
	}
	return new JSZip();
}

async function batchDownloadMedia(items: SavedContent[]): Promise<Blob | null> {
	const downloadIndicator = ElLoading.service({
		fullscreen: true,
		text: "Download Preparation",
		target: "#topArea",
	});

	const urls: {
		url: string;
		name: string;
		needYtDl: boolean;
		folder: string;
	}[] = [];
	items.forEach(el => {
		urls.push(...batchGetItemInfo(el));
	});
	// todo interupt server udring downlaod error
	try {
		const x = await fetchBatchMediaInfo(urls, cancelController.signal);
		const blob = await fetchData(x, downloadIndicator);
		if (blob) {
			void loadAsync(blob)
				.then(el => el.files["result.json"].async("string"))
				.then(res => {
					const arrays = JSON.parse(res) as SuccessList;
					if (arrays.fail.length > 0) {
						throw new PartialDownloadError(arrays);
					}
					return arrays;
				});
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

export async function singleDownload(item: SavedContent): Promise<void> {
	const itemType: string = item.type;
	if (item.isGallery) {
		await batchDownload([item]);
	} else if (
		itemType === postType.TEXT ||
		itemType === postType.LINK ||
		itemType === postType.COMMENT
	) {
		downloadPageAsText(item);
	} else if (itemType === postType.IMAGE || itemType === postType.VIDEO) {
		await downloadMedia(item);
	} else {
		throw new UnknowTypeError(`Unknow type ${itemType}  ${item.title}`);
	}
}
