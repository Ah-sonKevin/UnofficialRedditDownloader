/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
//todo
import { postType } from "@/enum/postType";

const parser = new DOMParser();

function decodeHtml(txt: string): string {
  const res = parser.parseFromString(txt, "text/html").documentElement
    .textContent;
  return res ? res : "";
}
export default class SavedContent {
  isDeleted = false;
  isSelected = false;

  kind: string;
  id: string;
  fullname: string;

  author: string;
  postAuthor = "";
  postLink = "";

  subreddit: string;
  creationDate: Date;
  category = "";
  title: string;

  text = "";
  htmlText = "";

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

  getRedditLink(permalink: string): string {
    return "https://www.reddit.com" + permalink;
  }

  constructor(
    kind: string,
    _data: any,
    _externalUrl: string,
    _imageLink: string,
    _type: string,
    _embeddedUrl: string,
    _needYtDl: boolean
  ) {
    this.kind = kind;
    const data = _data;
    this.author = data.author;
    this.id = data.id;
    this.fullname = data.name;
    this.subreddit = data.subreddit;
    this.title = data.title;
    this.category = data.category;
    this.creationDate = new Date(data.created_utc);
    this.redditUrl = "https://www.reddit.com" + (data.permalink as string); //tocheck

    this.type = _type;
    this.imageLink = _imageLink;
    this.needYtDl = _needYtDl;
    this.externalUrl = _externalUrl;
    this.embeddedUrl = _embeddedUrl;

    if (kind === "t1") {
      this.type = postType.COMMENT;
      this.text = data.body;
      this.htmlText = decodeHtml(data.body_html);
      this.title = data.link_title;
      this.postAuthor = data.link_author;
      this.postLink = data.link_url;
    } else if (data.is_self) {
      this.type = postType.TEXT; //Self post does not link outside of reddit (pure text)
      this.text = data.selftext;
      this.htmlText = decodeHtml(data.selftext_html);
    } else if (data.is_gallery) {
      this.type = postType.IMAGE;
      this.isGallery = data.is_gallery;
      for (const el in data.media_metadata) {
        this.galleryURLs.push("https://i.redd.it/" + el + ".jpg");
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
