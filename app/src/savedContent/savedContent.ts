import { postType } from "@/enum/postType";
import { RedditRawData } from "./redditDataInterface";

const parser = new DOMParser();

function decodeHtml(txt: string): string {
	const res = parser.parseFromString(txt, "text/html").documentElement
		.textContent;
	return res || "";
}
export default class SavedContent {
	isDeleted = false;

	isSelected = false;

	kind: string;

	// tocheck	id: string;

	fullname: string;

	author: string;

	postAuthor?: string;

	postLink?: string;

	subreddit: string;

	creationDate: Date;

	category = "";

	title: string;

	text?: string;

	htmlText?: string;

	redditUrl: string;

	externalUrl = "";

	imageLink: string;

	embeddedUrl: string;

	hasImage = false;

	isVideo = false;

	isText = false;

	isLink = false;

	isGallery = false;

	galleryURLs: string[] = [];

	type: string;

	needYtDl = false;

	// todo composition
	// eslint-disable-next-line max-statements
	constructor(
		kind: string,
		_data: RedditRawData,
		{
			_externalUrl,
			_imageLink,
			_type,
			_embeddedUrl,
			_needYtDl,
		}: {
			_externalUrl: string;
			_imageLink: string;
			_type: string;
			_embeddedUrl: string;
			_needYtDl: boolean;
		},
	) {
		this.kind = kind;
		const data = _data;
		this.author = data.author;
		//	this.id = data.id;
		this.fullname = data.name;
		this.subreddit = data.subreddit;
		this.title = data.title ?? ""; // tocheck comment
		this.category = data.category ?? "";
		this.creationDate = new Date(data.created_utc);
		this.redditUrl = `https://www.reddit.com${data.permalink}`;

		this.type = _type;
		this.imageLink = _imageLink;
		this.needYtDl = _needYtDl;
		this.externalUrl = _externalUrl;
		this.embeddedUrl = _embeddedUrl;

		if (kind === "t1") {
			this.type = postType.COMMENT;
			this.text = data.body ?? "";
			this.htmlText = decodeHtml(data.body_html ?? "");
			this.title = data.link_title ?? ""; // tocheck
			this.postAuthor = data.link_author ?? "";
			this.postLink = data.link_url ?? "";
		} else if (data.is_self) {
			this.type = postType.TEXT;
			this.text = data.selftext ?? ""; // tocheck
			this.htmlText = decodeHtml(data.selftext_html ?? "");
		} else if (data.is_gallery) {
			this.type = postType.IMAGE;
			this.isGallery = data.is_gallery;
			if (data.media_metadata) {
				// tocheck
				Object.keys(data.media_metadata).forEach((el) => {
					this.galleryURLs.push(`https://i.redd.it/${el}.jpg`);
				});
			}
			this.imageLink = this.galleryURLs[0];
		}
		this.hasImage =
			this.type === postType.IMAGE ||
			this.type === postType.VIDEO ||
			this.type === postType.LINK;

		this.isText = this.type === postType.COMMENT || this.type === postType.TEXT;
		this.isVideo = this.type === postType.VIDEO;
		this.isLink = this.type === postType.LINK;
	}
}
