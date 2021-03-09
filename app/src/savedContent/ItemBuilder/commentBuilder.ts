import { PostType } from "@/enum/postType";
import { ISavedCommentPost } from "../ISavedContent";
import { RedditRawData } from "../redditDataInterface";
import SavedContent from "../savedContent";
import { cleanURL, clearText, decodeHtml } from "./helper";

export function buildCommentPost(data: RedditRawData): ISavedCommentPost {
	const content = new SavedContent(data, PostType.COMMENT);
	if (!data.body || !data.body_html || !data.link_author || !data.link_url) {
		throw new Error(
			`COMMENT ${!!data.body}  ${!!data.body_html}  ${!!data.link_author}  ${!!data.link_url}`,
		);
	}
	const text = clearText(data.body);
	const htmlText = clearText(decodeHtml(data.body_html));
	return {
		...content,
		comment: {
			text,
			htmlText,
			postAuthor: data.link_author,
			postLink: cleanURL(data.link_url),
		},
		getText: () => text,
		getHtmlText: () => htmlText,
	};
}
