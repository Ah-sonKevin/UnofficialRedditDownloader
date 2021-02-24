// todo reduce
interface RedditVideo {
	fallback_url: string;
	height: number;
	width: number;
	scrubber_media_url: string;
	dash_url: string;
	duration: number;
	hls_url: string;
	is_gif: boolean;
}

interface SecureMedia {
	reddit_video?: Partial<RedditVideo>;
	type?: string;
	oembed?: Partial<Oembed>;
}

interface Media {
	reddit_video?: Partial<RedditVideo>;
	type?: string;
	oembed?: Partial<Oembed>;
}

interface Source {
	url: string;
	width: number;
	height: number;
}

interface Resolution {
	url: string;
	width: number;
	height: number;
}

interface Image {
	source: Source;
	resolutions: Resolution[];
	id: string;
}

interface Preview {
	images: Image[];
	enabled?: boolean;
	reddit_video_preview?: Partial<RedditVideoPreview>;
}

export interface SecureMediaEmbed {
	content: string;
	width: number;
	scrolling: boolean;
	media_domain_url: string;
	height: number;
}

export interface MediaEmbed {
	content: string;
	width: number;
	scrolling: boolean;
	height: number;
}

export interface RedditRawData {
	author_fullname: string;
	author_premium: boolean;
	author: string;
	body?: string;
	body_html?: string;
	category?: string | null;
	content_categories?: string | null;
	created_utc: number;
	created: number;
	crosspost_parent_list?: RedditRawData[];
	crosspost_parent?: string;
	domain?: string;
	id: string;
	is_crosspostable?: boolean;
	is_reddit_media_domain?: boolean;
	is_self?: boolean | null;
	is_video?: boolean;
	media_embed?: Partial<MediaEmbed> | null;
	media_metadata?: Partial<MediaMetadata> | null;
	media_only?: boolean;
	media?: Partial<Media> | null;
	name: string;
	permalink: string;
	post_hint?: string;
	preview?: Partial<Preview>;
	secure_media_embed?: Partial<SecureMediaEmbed> | null;
	secure_media?: Partial<SecureMedia> | null;
	selftext_html?: string | null;
	selftext?: string | null;
	subreddit_id: string;
	subreddit: string;
	thumbnail_height?: number | null;
	thumbnail_width?: number | null;
	thumbnail?: string;
	title?: string;
	url_overridden_by_dest?: string;
	url?: string;
	link_id?: string;
	link_title?: string;
	link_permalink?: string;
	link_author?: string;
	link_url?: string;
	is_gallery?: boolean;
}

export interface Oembed {
	provider_url: string;
	version: string;
	title: string;
	type: string;
	thumbnail_width: number;
	height: number;
	width: number;
	html: string;
	author_name: string;
	provider_name: string;
	thumbnail_url: string;
	thumbnail_height: number;
	author_url: string;
}

export interface RedditVideoPreview {
	fallback_url: string;
	height: number;
	width: number;
	scrubber_media_url: string;
	dash_url: string;
	duration: number;
	hls_url: string;
	is_gif: boolean;
}

interface MediaMetadata {
	[key: string]: unknown;
}
