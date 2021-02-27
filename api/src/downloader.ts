import ffmpeg from "fluent-ffmpeg";
import { createReadStream, createWriteStream, unlink } from "fs";
import fetch from "node-fetch";
import Stream from "stream";
import {
	isMultiChannel,
	isOneChannel,
	ItemInfo,
	MultiChannelItemInfo,
	OneChannelItemInfo,
} from "./interface/itemInfo";

export {}; // todo needed for module with its own scope
require("express-zip");

const BASE_PATH = "media/";

export async function download(
	item: OneChannelItemInfo,
): Promise<NodeJS.ReadableStream> {
	// tocheck type
	const res = await fetch(item.url);
	return res.body;
}

export function cleanString(text: string): string {
	return text
		.replace(/\W/gi, "_")
		.replace(/_+/gi, "_")
		.replace(/^_/, "")
		.replace(/_$/, "");
}
// eslint-disable-next-line max-lines-per-function
export async function youtubeDlDownload(
	itemInfo: ItemInfo,
): Promise<NodeJS.ReadableStream> {
	function streamMerge(
		{
			videoExt,
			videoNameFile,
			audioNameFile,
		}: { videoExt: string; videoNameFile: string; audioNameFile: string },
		resolve: (arg0: Stream.Readable) => void,
		reject: (arg0: Error) => void,
	) {
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
						reject(new Error()); // todo check empty error
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
	function makeName(name: string, ext: string, type: "video" | "audio") {
		return `${BASE_PATH}${cleanString(name)}_${type}.${cleanString(ext)}`;
	}

	function downloadChannel( // tocheck promisify ?
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
	// eslint-disable-next-line max-statements
	async function multiChannelDownload(
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
		if (respVideo.ok) {
			const respAudio = await fetch(multiItemInfo.audio.url);
			if (respAudio.ok) {
				return new Promise((resolve, reject) => {
					downloadChannel(respVideo.body, videoNameFile, () => {
						videoStreamDone = true;
						if (videoStreamDone && audioStreamDone) {
							streamMerge(
								{ videoExt, videoNameFile, audioNameFile },
								resolve,
								reject,
							);
						}
					});

					Stream.pipeline(
						respAudio.body,
						createWriteStream(audioNameFile),
						(err) => {
							if (err) {
								throw err;
							} else {
								audioStreamDone = true;
								if (videoStreamDone && audioStreamDone) {
									streamMerge(
										{ videoExt, videoNameFile, audioNameFile },
										resolve,
										reject,
									);
								}
							}
						},
					);
				});
			}
			throw new Error();
		}
		throw new Error();
	}

	async function oneChannelDownload(oneChannelInfo: OneChannelItemInfo) {
		const res = await fetch(oneChannelInfo.url);
		if (res.ok) {
			return res.body.pause(); // tocheck
		}
		throw new Error();
	}

	async function downloadItem(): Promise<NodeJS.ReadableStream> {
		if (isOneChannel(itemInfo)) {
			return oneChannelDownload(itemInfo);
		}
		if (isMultiChannel(itemInfo)) {
			return multiChannelDownload(itemInfo);
		}
		throw new Error("Invalid item info");
	}

	return downloadItem();
}
// todo replace throw with next (auto logServer in next)
export function downloader(itemInfo: ItemInfo): Promise<NodeJS.ReadableStream> {
	if (itemInfo.needYoutubeDl) {
		return youtubeDlDownload(itemInfo);
	}
	if (isOneChannel(itemInfo)) {
		return download(itemInfo);
	}
	return Promise.reject(new Error("Invalid download info")); // check structure
}
