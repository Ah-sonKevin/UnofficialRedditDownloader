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

	constructor(_data: RedditRawData) {
		const data = _data;
		this.author = data.author;
		this.id = data.id;
		this.fullname = data.name;
		this.subreddit = data.subreddit;
		this.title = data.title ?? data.link_title ?? "";
		this.category = data.category ?? "";
		this.creationDate = new Date(data.created_utc);
		this.redditUrl = `https://www.reddit.com${data.permalink}`;
	}
}
