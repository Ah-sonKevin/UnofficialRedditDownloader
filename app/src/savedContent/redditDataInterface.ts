// todo reduce
interface RedditVideo {
	fallback_url: string;
}
interface Media {
	reddit_video?: Partial<RedditVideo>;
	oembed?: Partial<Oembed>;
}

interface Source {
	url: string;
}

interface Image {
	source: Source;
}
interface Preview {
	images: Image[];
	reddit_video_preview?: Partial<RedditVideo>;
}

export interface MediaEmbed {
	content: string;
}

export interface Oembed {
	html: string;
	thumbnail_url: string;
	type: string;
}

export interface RedditRawData {
	author: string;
	body?: string;
	body_html?: string;
	category?: string | null;
	content_categories?: string | null;
	created_utc: number;
	crosspost_parent_list?: RedditRawData[];
	domain?: string; // tocheck
	is_reddit_media_domain?: boolean;
	is_self?: boolean | null;
	is_video?: boolean;
	media_embed?: Partial<MediaEmbed> | null;
	media_metadata?: Partial<MediaMetadata> | null;
	media?: Partial<Media> | null;
	name: string;
	permalink: string;
	post_hint?: string;
	preview?: Partial<Preview>;
	selftext_html?: string | null;
	selftext?: string | null;
	subreddit: string;
	title?: string;
	url_overridden_by_dest?: string;
	url?: string;
	link_title?: string;
	link_author?: string;
	link_url?: string;
	is_gallery?: boolean;
}

interface MediaMetadata {
	[key: string]: unknown;
}
