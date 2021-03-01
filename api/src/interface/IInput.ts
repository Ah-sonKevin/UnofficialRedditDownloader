import { RedditItem } from "./Item";

export interface HeadInput {
	url: string;
}

export interface SoloItem {
	url: string;
	needYdl: string;
}
export function isSIngleHeadBody(item: unknown): item is HeadInput {
	return (item as { url: string }).url !== undefined;
}

export function isMultipleBody(item: unknown): item is RedditItem[] {
	// batchItem or RedditItem
	const tmpArray = item as {
		needYtDl: string;
		folder?: string;
		name: string;
		url: string;
	}[];
	const tmp = tmpArray[0];
	return (
		tmp &&
		tmp.name !== undefined &&
		tmp.needYtDl !== undefined &&
		tmp.url !== undefined
	);
}
