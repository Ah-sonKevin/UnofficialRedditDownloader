import fetch from "node-fetch";
import util from "util";
import youtubeDl from "youtube-dl";
import mediaFormat from "./enum/mediaFormat";
import { RedditItem } from "./interface/Item";
import { ItemInfo } from "./interface/itemInfo";
import { YoutubeDlInfo } from "./interface/youtubeDlInfo";

function oneParameterYoutubeGetInfoFormat(
	args: { url: string; format: string },
	callback: (err: Error, info: youtubeDl.Info) => void,
): void {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-call
	return youtubeDl.getInfo(
		args.url,
		[
			"--hls-prefer-ffmpeg",
			"--restrict-filenames",
			"--output=media/%(title)s.%(ext)s",
			`--format=${args.format}`,
		],
		{},
		callback,
	);
}

function oneParameterYoutubeGetInfo(
	url: string,
	callback: (err: Error, info: youtubeDl.Info) => void,
): void {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-call
	return youtubeDl.getInfo(url, callback);
}

export const getDownloadInfoFormat = util.promisify(
	oneParameterYoutubeGetInfoFormat,
);

export const getDownloadInfo = util.promisify(oneParameterYoutubeGetInfo);

function isInfo(item: YoutubeDlInfo | youtubeDl.Info): item is YoutubeDlInfo {
	return (item as YoutubeDlInfo).url !== undefined;
}
export async function getInfoFormat(
	url: string,
	format: string,
): Promise<YoutubeDlInfo> {
	const info = await getDownloadInfoFormat({ format, url }); // toremember type from @types are incomplete
	if (isInfo(info)) {
		return info;
	}
	throw new Error("Invalid Information");
}

export function getSize(url: string): Promise<number> {
	return fetch(url, { method: "HEAD" }).then((res) => {
		const { headers } = res;
		const size = headers.get("content-length");
		if (headers) {
			return size ? parseInt(headers.get("content-length") ?? "0") : 0;
		}
		return 0;
	});
}

/**
 * @param {string} url
 * @param {boolean} needYoutubeDl
 * @param {string} name
 * @param {string} folder
 */
export async function getAllInfo(item: RedditItem): Promise<ItemInfo> {
	if (!item.needYtdl) {
		const size = await getSize(item.url);
		if (size) {
			return {
				url: item.url,
				size,
				name: item.name,
				needYoutubeDl: item.needYtdl,
				ext: item.url.split(".").slice(-1)[0],
			};
		}
		throw new Error();
	}
	return getInfoFormat(item.url, mediaFormat.allInOne)
		.then(async (info) => {
			const size = await getSize(info.url);
			// TocheckOnRun check info.size
			if (size) {
				return {
					url: item.url,
					size,
					name: `${info.filename.split(".")[0]}`,
					ext: info.ext,
					needYoutubeDl: item.needYtdl,
				};
			}
			throw new Error();
		})
		.catch(async () => {
			const infoVideo = await getInfoFormat(item.url, mediaFormat.videoStream);
			const infoAudio = await getInfoFormat(item.url, mediaFormat.audioStream);
			const sizeVideo = await getSize(infoVideo.url);
			const sizeAudio = await getSize(infoAudio.url);
			if (sizeVideo && sizeAudio) {
				return {
					isOneFile: false,
					video: { url: infoVideo.url, ext: infoVideo.ext },
					audio: { url: infoAudio.url, ext: infoAudio.ext },
					size: sizeAudio + sizeVideo,
					name: `${item.name.split(".")[0]}`,
					ext: infoVideo.ext,
					needYoutubeDl: item.needYtdl,
				};
			}
			throw new Error();
		});
}

// toremember export {};  needed for module with its own scope
