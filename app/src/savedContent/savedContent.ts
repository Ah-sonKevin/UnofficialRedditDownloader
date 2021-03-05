import { cleanString } from "@/helper/stringHelper";
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

	constructor(data: RedditRawData) {
		const getTitle = (): string => {
			if (data.title) {
				return cleanString(data.title);
			}
			if (data.link_title) {
				return cleanString(data.link_title);
			}
			return "";
		};
		this.author = data.author;
		this.id = data.id;
		this.fullname = data.name;
		this.subreddit = data.subreddit;
		this.title = getTitle();
		this.category = data.category ?? "";
		this.creationDate = new Date(data.created_utc);
		this.redditUrl = `https://www.reddit.com${data.permalink}`;
	}
}
