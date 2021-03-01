import { postType } from "@/enum/postType";
import { ISavedCommentPost } from "../ISavedContent";
import { RedditRawData } from "../redditDataInterface";
import SavedContent from "../savedContent";
import { cleanURL, decodeHtml } from "./helper";

export function buildCommentPost(data: RedditRawData): ISavedCommentPost {
	// todo redo
	const content = new SavedContent(data, postType.COMMENT);
	if (!data.body || !data.body_html || !data.link_author || !data.link_url) {
		throw new Error();
	}
	return {
		...content,
		comment: {
			text: data.body,
			htmlText: decodeHtml(data.body_html),
			postAuthor: data.link_author,
			postLink: cleanURL(data.link_url),
		},
	};
}
