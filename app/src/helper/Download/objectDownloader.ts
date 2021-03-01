import { postType } from "@/enum/postType";
import { UnknowTypeError } from "@/errors/restartError";
import {
	ISavedTextPost,
	isText,
	SavedContentType,
} from "../../savedContent/ISavedContent";
import { getMediaArchive } from "./batchDownload";
import { cancelController, getName } from "./helper";
import { downloadMedia } from "./mediaDownloader";
import { downloadPageAsText, getText } from "./textDownloader";

export function cancelDownload(): void {
	cancelController.abort();
}
// todo test hover
// todo test notif
// todo test download a part
// todo test throw error

// eslint-disable-next-line max-statements

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
	return { blob: new Blob([zip]), name: getName("archive", "zip") };
}

async function singleDownload(
	item: SavedContentType,
): Promise<{ blob: Blob; name: string }> {
	const itemType: string = item.type;
	if (item.isGallery) {
		return batchDownload([item]);
	}
	if (
		// tocheck link has text ?
		isText(item) // ||
		// tocheck isLink(item)
		/*	itemType === postType.TEXT ||
		itemType === postType.LINK ||
		itemType === postType.COMMENT */
	) {
		return {
			blob: downloadPageAsText(item),
			name: getName(item.title, "html"),
		};
	}
	if (itemType === postType.IMAGE || itemType === postType.VIDEO) {
		return downloadMedia(item);
	}
	throw new UnknowTypeError(`Unknow type ${itemType}  ${item.title}`);
}
