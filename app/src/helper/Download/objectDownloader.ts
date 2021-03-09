import {
	hasMedia,
	hasText,
	isGallery,
	isLink,
	Media,
	SavedContentType,
	Textual,
} from "../../savedContent/ISavedContent";
import { exhaustivenessCheck } from "../exhaustivenessChecker";
import { getMediaArchive } from "./batchDownload";
import { cancelController, getName } from "./helper";
import { downloadMedia } from "./mediaDownloader";
import { downloadPageAsText, getText } from "./textDownloader";

export function cancelDownload(): void {
	cancelController.abort();
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

export async function download(
	items: SavedContentType | SavedContentType[],
): Promise<void> {
	if (Array.isArray(items)) {
		if (items.length === 1) {
			const { blob, name } = await singleDownload(items[0]);
			downloadObject(blob, name);
		} else {
			const { blob, name } = await batchDownload(items);
			downloadObject(blob, name);
		}
	} else {
		const { blob, name } = await singleDownload(items);
		downloadObject(blob, name);
	}
}

async function batchDownload(
	items: SavedContentType[],
): Promise<{ blob: Blob; name: string }> {
	const medias: (SavedContentType & Media)[] = [];
	const texts: (SavedContentType & Textual)[] = [];
	items.forEach((item) => {
		if (hasMedia(item)) {
			medias.push(item);
		} else if (hasText(item)) {
			texts.push(item);
		} else if (isLink(item)) {
			// tocheck
			throw new Error();
		} else {
			exhaustivenessCheck(item);
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
	return { blob: new Blob([zip]), name: getName("archive", "zip") };
}

async function singleDownload( // tocheck link
	item: SavedContentType,
): Promise<{ blob: Blob; name: string }> {
	if (isGallery(item)) {
		return batchDownload([item]);
	}
	if (hasText(item)) {
		return {
			blob: downloadPageAsText(item),
			name: getName(item.title, "html"),
		};
	}
	if (hasMedia(item)) {
		return downloadMedia(item);
	}
	if (isLink(item)) {
		// tocheck
		throw new Error();
	}
	return exhaustivenessCheck(item);
}
