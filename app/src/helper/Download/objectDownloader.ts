import { postType } from "@/enum/postType";
import {
	DownloadError,
	NetworkError,
	UnknowTypeError,
} from "@/errors/restartError";
import SavedContent from "@/savedContent/savedContent";
import { ElLoading } from "element-plus";
import { ILoadingInstance } from "element-plus/lib/el-loading/src/loading.type";
import jszip, { loadAsync } from "jszip";
import { PartialDownloadError } from "../../errors/notifError";
import { ItemInfo, SuccessList } from "../../savedContent/ItemInterface";
import { fetchBatchMediaInfo, fetchMedia } from "../fetchHelper/fetchHelper";
import { notify } from "../notifierHelper";
import { cleanString } from "../stringHelper";

let downloading = false;
const cancelController = new AbortController(); // tocheck object

function cancelDownload() {
	notify("Download Canceled");
	downloading = false; // tocheck still needed ?
	cancelController.abort();
}

function getName(text: string, extension: string): string {
	return `${cleanString(text)}.${extension}`;
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

const suffixList = ["B", "KiB", "MiB", "GiB"];
const SIZE_RATIO = 1024;
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
	}; // tocheck
}
//
function updateDownloadSpinner(
	downloadIndicator: ILoadingInstance,
	receivedData: number,
	size: number,
	divider: number,
	extension: string,
) {
	downloadIndicator.setText(
		`Downloading : ${receivedData / divider}/${size} ${extension}`,
	);
}

const SPINNER_UPDATE_FREQUENCY = 1000;
async function fetchData(
	x: Response,
	downloadIndicator: ILoadingInstance,
	name: string,
) {
	// downloading= true
	if (x.ok) {
		const tmpSize = x.headers.get("MediaSize");
		downloadIndicator.setText("Downloading ...");
		const fileChunks: Uint8Array[] = [];
		let receivedData = 0;

		let updateSpinner;
		if (tmpSize) {
			updateSpinner = setInterval(() => {
				const totalSize = parseInt(tmpSize);
				const { suffix, divider, size } = getSizeInfo(totalSize);
				updateDownloadSpinner(
					downloadIndicator,
					receivedData,
					size,
					divider,
					suffix,
				);
			}, SPINNER_UPDATE_FREQUENCY);
		}

		const reader = x.body?.getReader();
		if (!reader) {
			downloadIndicator.close();
			throw new DownloadError();
		}
		let reading = true;

		// eslint-disable-next-line no-loops/no-loops
		while (reading && downloading) {
			// replace no for loop
			// eslint-disable-next-line no-await-in-loop
			const { done, value } = await reader.read();
			if (done) {
				reading = false;
			} else {
				if (!value) {
					downloadIndicator.close();
					throw new DownloadError();
				}
				fileChunks.push(value);
				receivedData += value.length;
			}
		}

		downloadIndicator.close();
		if (updateSpinner) {
			clearInterval(updateSpinner);
		}
		if (downloading) {
			const file = new Blob(fileChunks);
			return file;
		}
		return undefined;
	}
	downloadIndicator.close();
	throw new DownloadError();
}

async function downloadMedia(item: SavedContent) {
	const downloadIndicator = ElLoading.service({
		fullscreen: true,
		text: "Download Preparation",
		target: "#topArea",
	});

	const url = item.externalUrl;
	const request = fetchMedia(url, item.needYtDl, cancelController.signal);
	try {
		const x = await request;
		const data = await fetchData(
			x,
			downloadIndicator,
			getName(item.title, url.split(".").slice(-1)[0]),
		);
		// downloadObject(file, name);
		if (data) {
			downloadObject(data, "name"); // todo redo flow
		}
	} catch (err) {
		if ((err as Error).name === "AbortError") {
			notify("Download has been Canceled");
		} else {
			throw err;
		}
	}
}

function downloadObject(object: any, nom: string): void {
	// to change object type
	const img = URL.createObjectURL(object);
	const linkDown = document.createElement("a");
	linkDown.href = img;
	linkDown.setAttribute("download", nom);
	linkDown.click();
	linkDown.remove();
	URL.revokeObjectURL(img);
}

function getURL(
	item: SavedContent,
): { url: string; name: string; needYtDl: boolean; folder: string } {
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
			name: getName(item.title, "html"),
			folder: "",
			needYtDl: false,
		};
	}
	return {
		url: item.externalUrl,
		// name: getName(item.title, item.externalUrl.split(".").slice(-1)[0]),
		name: cleanString(item.title),
		folder: "",
		needYtDl: item.needYtDl,
	};
}

function getBatchUrl(item: SavedContent): ItemInfo[] {
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
	return [getURL(item)];
}

export function download(items: SavedContent | SavedContent[]): void {
	if (Array.isArray(items)) {
		if (items.length === 1) {
			void singleDownload(items[0])
				.then(() => {
					downloading = false;
					return downloading;
				})
				.catch(err => console.log(err));
		} else {
			void batchDownload(items).then(() => {
				downloading = false;
				return downloading;
			});
		}
	} else {
		void singleDownload(items).then(() => {
			downloading = false;
			return downloading;
		});
	}
}

export async function batchDownload(items: SavedContent[]): Promise<void> {
	// return archive ?
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
		name: cleanString(el.title),
		content: getText(el),
	}));
	const blob = await batchDownloadMedia(medias);
	if (blob) {
		const archive = await loadAsync(blob);
		textContents.forEach(el => {
			void archive.file(el.name, el.content);
		});
		downloadObject(archive, "archive");
	} else if (textContents) {
		// eslint-disable-next-line new-cap
		const archive = new jszip();
		textContents.forEach(el => {
			archive.file(el.name, el.content);
		});
		const zip = await archive.generateAsync({ type: "uint8array" });
		downloadObject(zip, "archive");
	}
}

async function batchDownloadMedia(items: SavedContent[]): Promise<Blob | null> {
	downloading = true;

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
		urls.push(...getBatchUrl(el));
	});
	// todo test download
	const x = await fetchBatchMediaInfo(urls, cancelController.signal);
	const blob = await fetchData(x, downloadIndicator, "a.zip");

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
}

export async function singleDownload(item: SavedContent): Promise<void> {
	downloading = true;
	const itemType: string = item.type;
	if (item.isGallery) {
		await batchDownload([item]);
	} else if (
		itemType === postType.TEXT ||
		itemType === postType.LINK ||
		itemType === postType.COMMENT
	) {
		downloadPageAsText(item);
		downloading = false;
	} else if (itemType === postType.IMAGE || itemType === postType.VIDEO) {
		await downloadMedia(item);
	} else {
		throw new UnknowTypeError(`Unknow type ${itemType}  ${item.title}`);
	}
}
