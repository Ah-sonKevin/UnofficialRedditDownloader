import { RedditRawData } from "./redditDataInterface";

export interface RawItem {
	data: {
		children: RawItemUnit[];
		after: string | null;
	};
}

export interface RawItemUnit {
	kind: string;
	data: RedditRawData;
}

export function isRawItemArray(item: unknown): item is RawItem[] {
	const tmp = item as RawItem[];
	const x = tmp[0];
	return x && isRawItem(x);
}

export function isRawItem(item: unknown): item is RawItem {
	const tmp = item as RawItem;
	return tmp.data !== undefined;
}
