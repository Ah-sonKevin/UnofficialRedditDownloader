import { PostType } from "@/enum/postType";
import { ISavedTextPost } from "../ISavedContent";
import { RedditRawData } from "../redditDataInterface";
import SavedContent from "../savedContent";
import { clearText, decodeHtml } from "./helper";

export function buildTextPost(
	kind: string,
	data: RedditRawData,
): ISavedTextPost {
	const content = new SavedContent(data, PostType.TEXT);
	if (!data.selftext || !data.selftext_html) {
		throw new Error();
	}
	const text = clearText(data.selftext);
	const htmlText = clearText(decodeHtml(data.selftext_html));
	return {
		...content,
		text: {
			text,
			htmlText,
		},
		getText: () => text,
		getHtmlText: () => htmlText,
	};
}
