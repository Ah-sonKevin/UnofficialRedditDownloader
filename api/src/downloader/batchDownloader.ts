import { RedditItem } from "../interface/Item";
import { ItemInfo } from "../interface/itemInfo";
import { getAllInfo } from "../item";
import Zipper from "../zipper";
import { downloader } from "./downloader";

export function getAllFilesInfo(
	listItem: RedditItem[],
	archive: Zipper,
	prepArray: ItemInfo[],
): Promise<ItemInfo>[] {
	const prepPromiseArray: Promise<ItemInfo>[] = [];

	listItem.forEach((item) => {
		async function getAllInfoPrep(): Promise<ItemInfo> {
			try {
				const elInfo = await getAllInfo(item);
				prepArray.push(elInfo);
				return elInfo;
			} catch (e) {
				archive.addDownloadFail(item, "Couldn't get Info");
				throw e;
			}
		}
		// toremember check element-plus grid (design)
		prepPromiseArray.push(getAllInfoPrep());
	});
	return prepPromiseArray;
}

function downloadItem(element: ItemInfo, archive: Zipper): Promise<void> {
	return new Promise(
		(resolve, reject) =>
			// eslint-disable-next-line promise/no-nesting
			void downloader(element)
				.then((stream) =>
					archive.addStream({
						stream,
						nameFile: element.name,
						resolve,
						reject,
					}),
				)
				.catch((err: Error) => {
					archive.addDownloadFail(element, "Couldn't download the file");
					reject(err);
				}),
	);
}

export function downloadAllItems(
	prepArray: ItemInfo[],
	archive: Zipper,
): Promise<void>[] {
	const promiseArray: Promise<void>[] = [];
	prepArray.forEach((element) => {
		promiseArray.push(downloadItem(element, archive));
	});
	return promiseArray;
}
