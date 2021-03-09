import { PostType } from "../enum/postType";

export interface IText {
	text: string;
	htmlText: string;
}

export interface IComment {
	text: string;
	htmlText: string;
	postAuthor: string;
	postLink: string;
}

export interface IImage {
	imageLink: string;
}

export interface IGallery {
	galleryURLs: string[];
}

export interface IVideo {
	externalUrl: string;
	imageLink: string;
	embeddedUrl: string;
	needYtDl: boolean;
}

export interface ILink {
	externalUrl: string;
	imageLink: string;
}

export interface Media {
	getMediaUrl: () => string;
	getImageUrl: () => string;
}

export interface Textual {
	getText: () => string;
	getHtmlText: () => string;
}

export interface ISavedContentBase {
	isDeleted: boolean;
	isSelected: boolean;
	id: string;
	fullname: string;
	author: string;
	subreddit: string;
	creationDate: Date;
	category: string;
	title: string;
	redditUrl: string;
	type: PostType;
}

export type SavedContentType =
	| ISavedTextPost
	| ISavedImagePost
	| ISavedVideoPost
	| ISavedLinkPost
	| ISavedGalleryPost
	| ISavedCommentPost;

export interface ISavedCommentPost extends ISavedContentBase, Textual {
	//	metadata: ISavedContent;
	comment: IComment;
}

export interface ISavedTextPost extends ISavedContentBase, Textual {
	//	metadata: ISavedContent;
	text: IText;
}

export interface ISavedImagePost extends ISavedContentBase, Media {
	//	metadata: ISavedContent;
	image: IImage;
}

export interface ISavedVideoPost extends ISavedContentBase, Media {
	//	metadata: ISavedContent;
	video: IVideo;
}

export interface ISavedLinkPost extends ISavedContentBase {
	//	metadata: ISavedContent;
	link: ILink;
}

export interface ISavedGalleryPost extends ISavedContentBase, Media {
	// metadata: ISavedContent;
	gallery: IGallery;
	image: IImage;
}

export function isGallery(item: ISavedContentBase): item is ISavedGalleryPost {
	const content = item as ISavedGalleryPost;
	return content.gallery !== undefined && content.image !== undefined;
}

export function isLink(item: ISavedContentBase): item is ISavedLinkPost {
	const content = item as ISavedLinkPost;
	return content.link !== undefined;
}

export function isVideo(item: ISavedContentBase): item is ISavedVideoPost {
	const content = item as ISavedVideoPost;
	return content.video !== undefined;
}

export function isImage(item: ISavedContentBase): item is ISavedImagePost {
	const content = item as ISavedImagePost;
	return content.image !== undefined;
}

export function isText(item: ISavedContentBase): item is ISavedTextPost {
	const content = item as ISavedTextPost;
	return content.text !== undefined;
}

export function isComment(item: ISavedContentBase): item is ISavedCommentPost {
	const comment = item as ISavedCommentPost;
	return comment.comment !== undefined;
}

export function hasMedia<T extends ISavedContentBase>(
	item: T,
): item is T & Media {
	return isImage(item) || isGallery(item) || isVideo(item);
}

export function hasPreviewMedia<T extends ISavedContentBase>( // tocheck
	item: T,
): item is T & Media {
	return isImage(item) || isGallery(item) || isVideo(item) || isLink(item);
}

export function hasText<T extends ISavedContentBase>(
	item: T,
): item is T & Textual {
	return isText(item) || isComment(item);
}
