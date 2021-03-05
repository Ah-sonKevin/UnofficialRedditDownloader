import { postType } from "@/enum/postType";
import { ISavedTextPost } from "../ISavedContent";
import { RedditRawData } from "../redditDataInterface";
import SavedContent from "../savedContent";
import { clearText, decodeHtml } from "./helper";

export function buildTextPost(
	kind: string,
	data: RedditRawData,
): ISavedTextPost {
	const content = new SavedContent(data);
	if (!data.selftext || !data.selftext_html) {
		throw new Error();
	}
	return {
		...content,
		text: {
			text: clearText(data.selftext),
			htmlText: clearText(decodeHtml(data.selftext_html)),
		},
	};
}
