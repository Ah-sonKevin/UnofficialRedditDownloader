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
  reddit_video: RedditVideo;
  type: string;
  oembed: Oembed;
}

interface Media {
  reddit_video: RedditVideo;
  type: string;
  oembed: Oembed;
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
  enabled: boolean;

  reddit_video_preview: RedditVideoPreview;
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
  category: string;
  clicked: boolean;
  content_categories?: string;
  contest_mode: boolean;
  created_utc: number;
  created: number;
  crosspost_parent_list: RedditRawData[];
  crosspost_parent: string;
  domain: string;
  downs: number;
  edited: boolean;
  gilded: number;
  hidden: boolean;
  hide_score: boolean;
  id: string;
  is_crosspostable: boolean;
  is_meta: boolean;
  is_original_content: boolean;
  is_reddit_media_domain: boolean;
  is_robot_indexable: boolean;
  is_self: boolean;
  is_video: boolean;
  media_embed?: MediaEmbed;
  media_metadata: MediaMetadata;
  media_only: boolean;
  media?: Media;
  name: string;
  no_follow: boolean;
  num_comments: number;
  over_18: boolean;
  parent_whitelist_status: string;
  permalink: string;
  pinned: boolean;
  post_hint: string;
  preview: Preview;
  secure_media_embed: SecureMediaEmbed;
  secure_media?: SecureMedia;
  selftext_html?: string;
  selftext: string;
  subreddit_id: string;
  subreddit_name_prefixed: string;
  subreddit_subscribers: number;
  subreddit_type: string;
  subreddit: string;
  thumbnail_height?: number;
  thumbnail_width?: number;
  thumbnail: string;
  title: string;
  url_overridden_by_dest: string;
  url: string;
  link_id: string;
  link_title: string;
  link_permalink: string;
  link_author: string;
  link_url: string;
  is_gallery: boolean;
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

export interface P {
  y: number;
  x: number;
  u: string;
}

export interface S {
  y: number;
  x: number;
  u: string;
}

interface Metadata {
  status: string;
  e: string;
  m: string;
  p: P[];
  s: S;
  id: string;
}

interface MediaMetadata {
  [key: string]: Metadata;
}
