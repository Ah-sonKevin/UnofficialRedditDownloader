import { postType } from "@/enum/postType";
import { ISavedLinkPost } from "../ISavedContent";
import { RedditRawData } from "../redditDataInterface";
import SavedContent from "../savedContent";
import { cleanURL, getImage } from "./helper";

export function buildLinkPost(data: RedditRawData): ISavedLinkPost {
	const content = new SavedContent(data);

	if (!data.url_overridden_by_dest) {
		throw new Error();
	}
	return {
		...content,
		link: {
			externalUrl: cleanURL(data.url_overridden_by_dest),
			imageLink: cleanURL(getImage(data)),
		},
	};
}
