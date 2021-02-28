import { postType } from "@/enum/postType";
import { ISavedContentBase } from "./ISavedContent";
import { RedditRawData } from "./redditDataInterface";

export default class SavedContent implements ISavedContentBase {
	isDeleted = false;

	isSelected = false;

	id: string;

	fullname: string;

	author: string;

	subreddit: string;

	creationDate: Date;

	category = "";

	title: string;

	redditUrl: string;

	hasImage = false; // tocheck needed, understand cast

	isVideo = false;

	isText = false;

	isLink = false;

	isGallery = false;

	type: string;

	// todo composition
	// eslint-disable-next-line max-statements
	constructor(_data: RedditRawData, _type: string) {
		const data = _data;
		this.author = data.author;
		this.id = data.id;
		this.fullname = data.name;
		this.subreddit = data.subreddit;
		this.title = data.title ?? data.link_title ?? ""; // tocheck comment
		this.category = data.category ?? "";
		this.creationDate = new Date(data.created_utc);
		this.redditUrl = `https://www.reddit.com${data.permalink}`;

		this.type = _type;

		// tocheck needed ??
		this.hasImage =
			this.type === postType.IMAGE ||
			this.type === postType.VIDEO ||
			this.type === postType.LINK;
		this.isGallery = data.is_gallery ?? false;

		this.isText = this.type === postType.COMMENT || this.type === postType.TEXT;
		this.isVideo = this.type === postType.VIDEO;
		this.isLink = this.type === postType.LINK;
	}
}
