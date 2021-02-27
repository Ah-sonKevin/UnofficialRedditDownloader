import youtubeDl from "youtube-dl";

export interface YoutubeDlInfo extends youtubeDl.Info {
	size: number;
	ext: string;
	title: string;
	url: string;
	filename: string;
}
