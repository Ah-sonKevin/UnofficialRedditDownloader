import { PostType } from "../../enum/postType";
import { ISavedGalleryPost } from "../ISavedContent";
import { RedditRawData } from "../redditDataInterface";
import SavedContent from "../savedContent";
import { cleanURL } from "./helper";

export function buildGalleryPost(data: RedditRawData): ISavedGalleryPost {
	const content = new SavedContent(data, PostType.IMAGE); // todo change
	const galleryURLs: string[] = [];
	if (data.media_metadata) {
		Object.keys(data.media_metadata).forEach((el) => {
			galleryURLs.push(cleanURL(`https://i.redd.it/${el}.jpg`));
		});
	}

	return {
		...content,
		gallery: { galleryURLs },
		image: { imageLink: cleanURL(galleryURLs[0]) },
		getMediaUrl: () => cleanURL(galleryURLs[0]),
		getImageUrl: () => cleanURL(galleryURLs[0]),
	};
}
