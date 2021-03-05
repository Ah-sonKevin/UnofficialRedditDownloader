import ffmpeg from "fluent-ffmpeg";
import { createReadStream, createWriteStream, unlink } from "fs";
import fetch from "node-fetch";
import Stream from "stream";
import { ItemInfo, MultiChannelItemInfo } from "../interface/itemInfo";

const BASE_PATH = "media/";
export function cleanString(text: string): string {
	return text
		.replace(/\W/gi, "_")
		.replace(/_+/gi, "_")
		.replace(/^_/, "")
		.replace(/_$/, "");
}
export function streamMerge(
	{
		itemInfo,
		videoExt,
		videoNameFile,
		audioNameFile,
	}: {
		videoExt: string;
		videoNameFile: string;
		audioNameFile: string;
		itemInfo: ItemInfo;
	},
	resolve: (arg0: Stream.Readable) => void,
	reject: (arg0: Error) => void,
): void {
	const nameFile = `${BASE_PATH}${itemInfo.name}.${videoExt}`;
	const clean = () => {
		unlink(videoNameFile, () => {});
		unlink(audioNameFile, () => {});
	};
	ffmpeg()
		.addInput(videoNameFile)
		.addInput(audioNameFile)
		.audioCodec("copy")
		.videoCodec("copy")
		.saveToFile(nameFile) // cant directly output stream for mp4 format
		.on("error", (err: Error) => {
			clean();
			reject(err);
		})
		.on("end", () => {
			clean();
			const stream: Stream.Readable = createReadStream(nameFile)
				.on("error", () => {
					unlink(nameFile, () => {});
					reject(new Error("Can't load stream"));
					stream.destroy();
				})
				.on("close", () => {
					unlink(nameFile, () => {});
				})
				.on("open", () => {
					stream.pause();
					resolve(stream);
				});
		});
}

function downloadChannel(
	mediaStream: NodeJS.ReadableStream,
	mediaName: string,
	callback: () => void,
) {
	Stream.pipeline(mediaStream, createWriteStream(mediaName), (err) => {
		if (err) {
			throw err;
		} else {
			callback();
		}
	});
}

function makeName(name: string, ext: string, type: "video" | "audio") {
	return `${BASE_PATH}${cleanString(name)}_${type}.${cleanString(ext)}`;
}

// eslint-disable-next-line max-statements
export async function multiChannelDownload(
	multiItemInfo: MultiChannelItemInfo,
): Promise<NodeJS.ReadableStream> {
	const videoExt: string = multiItemInfo.video.ext;
	const videoNameFile = makeName(multiItemInfo.name, videoExt, "video");

	const audioNameFile = makeName(
		multiItemInfo.name,
		multiItemInfo.audio.ext,
		"audio",
	);

	let videoStreamDone = false;
	let audioStreamDone = false;

	const respVideo = await fetch(multiItemInfo.video.url);
	const respAudio = await fetch(multiItemInfo.audio.url);
	if (!respVideo.ok || !respAudio.ok) {
		throw new Error();
	}
	return new Promise((resolve, reject) => {
		const merge = () =>
			streamMerge(
				{
					itemInfo: multiItemInfo,
					videoExt,
					videoNameFile,
					audioNameFile,
				},
				resolve,
				reject,
			);

		downloadChannel(respVideo.body, videoNameFile, () => {
			videoStreamDone = true;
			if (videoStreamDone && audioStreamDone) {
				merge();
			}
		});
	
		downloadChannel(respAudio.body, audioNameFile, () => {
			audioStreamDone = true;
			if (videoStreamDone && audioStreamDone) {
				merge();
			}
		});
	});
}
