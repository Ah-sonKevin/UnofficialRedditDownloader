import { RedditItem } from "./Item";

export interface HeadInput {
	url: string;
}

export interface RedditItem {
	url: string;
	needYtdl: boolean;
	name: string;
}
export function isRedditItem(item: unknown): item is RedditItem {
	const tmp = item as RedditItem;
	return (
		tmp.name !== undefined &&
		tmp.needYtdl !== undefined &&
		tmp.url !== undefined
	);
}

export function isHeadItemBody(item: unknown): item is HeadInput {
	return (item as { url: string }).url !== undefined;
}

export function isMultipleItemsBody(item: unknown): item is RedditItem[] {
	// batchItem or RedditItem
	const tmpArray = item as RedditItem[];
	const tmp = tmpArray[0];
	return tmp && isRedditItem(tmp);
}
