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

interface Media {
	getMediaUrl: () => string;
	getImageUrl: () => string;
}

export interface ISavedContentBase {
	isDeleted: boolean;
	isSelected: boolean;
	id: string;
	fullname: string;
	author: string;
	postAuthor?: string;
	postLink?: string;
	subreddit: string;
	creationDate: Date;
	category: string;
	title: string;
	redditUrl: string;
	type: string;

	// tocheck really needed ?
	hasImage: boolean; // tocheck needed, understand cas:boolean
	isVideo: boolean;
	isText: boolean;
	isLink: boolean;
	isGallery: boolean;
}

export type SavedContentType =
	| ISavedTextPost
	| ISavedImagePost
	| ISavedVideoPost
	| ISavedLinkPost
	| ISavedGalleryPost
	| ISavedCommentPost;

export interface ISavedCommentPost extends ISavedContentBase {
	//	metadata: ISavedContent;
	comment: IComment;
}

export interface ISavedTextPost extends ISavedContentBase {
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

export function isMedia(item: any): item is Media {
	// tocheck type any
	return isImage(item) || isGallery(item) || isVideo(item);
}