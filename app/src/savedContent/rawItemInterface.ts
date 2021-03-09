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
	if (Array.isArray(item) && item.length > 0) {
		const x: unknown = item[0];
		return x !== undefined && isRawItem(x);
	}
	return false;
}

export function isRawItem(item: unknown): item is RawItem {
	const tmp = item as RawItem;
	return tmp.data !== undefined;
}
