import { PostType } from "@/enum/postType";
import { ISavedImagePost } from "../ISavedContent";
import { RedditRawData } from "../redditDataInterface";
import SavedContent from "../savedContent";
import { cleanURL } from "./helper";

export function buildImagePost(data: RedditRawData): ISavedImagePost {
	const content = new SavedContent(data, PostType.IMAGE);
	const url = data.url_overridden_by_dest;
	if (!url) {
		throw new Error();
	}
	return {
		...content,
		image: { imageLink: cleanURL(url) },
		getMediaUrl: () => cleanURL(url),
		getImageUrl: () => cleanURL(url),
	};
}
