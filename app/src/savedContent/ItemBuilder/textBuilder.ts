import { postType } from "@/enum/postType";
import { ISavedTextPost } from "../ISavedContent";
import { RedditRawData } from "../redditDataInterface";
import SavedContent from "../savedContent";
import { decodeHtml } from "./helper";

export function buildTextPost(
	kind: string,
	data: RedditRawData,
): ISavedTextPost {
	// todo redo
	const content = new SavedContent(data, postType.TEXT);
	if (!data.selftext || !data.selftext_html) {
		throw new Error();
	}
	return {
		...content,
		text: {
			text: data.selftext,
			htmlText: decodeHtml(data.selftext_html),
		},
	};
}
