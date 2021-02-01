import { RedditRawData } from "../object/redditDataInterface";

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
