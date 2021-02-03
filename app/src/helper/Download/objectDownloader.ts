import { postType } from "@/enum/postType";
import {
	DownloadError,
	NetworkError,
	UnknowTypeError,
} from "@/errors/restartError";
import SavedContent from "@/savedContent/savedContent";
import { ElLoading } from "element-plus";
import { ILoadingInstance } from "element-plus/lib/el-loading/src/loading.type";
import { loadAsync } from "jszip";
import { PartialDownloadError } from "../../errors/notifError";
import { ItemInfo, SuccessList } from "../../savedContent/ItemInterface";
import { fetchBatchMediaInfo, fetchMedia } from "../fetchHelper/fetchHelper";
import { notify } from "../notifierHelper";
import { cleanString } from "../stringHelper";

let downloading = false;

function cancelDownload() {
	notify("Download Canceled");
	downloading = false;
}

function getName(text: string, extension: string): string {
	return `${cleanString(text)}.${extension}`;
}
// tocheck lint staged
function downloadPageAsText(item: SavedContent): void {
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

		let updateSpinner; // todo make dynamic
		if (tmpSize) {
			updateSpinner = setInterval(() => {
				// todo
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

		const fileChunks: Uint8Array[] = [];
		let receivedData = 0;
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
	const x = await fetchMedia(url, item.needYtDl);
	await fetchData(
		x,
		downloadIndicator,
		getName(item.title, url.split(".").slice(-1)[0]),
	);
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

// todo check batch text
export async function batchDownload(items: SavedContent[]): Promise<void> {
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

	const x = await fetchBatchMediaInfo(urls);
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
	} else {
		throw new NetworkError(x.statusText);
	}
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
