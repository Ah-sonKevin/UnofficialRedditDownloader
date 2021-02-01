import { RedditRawData } from "./redditDataInterface";

export interface RawItem {
	data: {
		children: RawItemUnit[];
		after: string;
	};
}

export interface RawItemUnit {
	kind: string;
	data: RedditRawData;
}
