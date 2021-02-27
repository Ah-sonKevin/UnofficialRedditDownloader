// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable max-lines-per-function */
import ffmpeg from "fluent-ffmpeg";
import { createReadStream, createWriteStream, unlink } from "fs";
import fetch from "node-fetch";
import {
	isMultiChannel,
	isOneChannel,
	ItemInfo,
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

export async function youtubeDlDownload(
	itemInfo: ItemInfo,
): Promise<NodeJS.ReadableStream> {
	// eslint-disable-next-line max-statements
	return new Promise((resolve, reject) => {
		let videoStreamDone = false;
		let audioStreamDone = false;
		let audioExt = "";
		let videoExt = "";
		let audioNameFile = "";
		let videoNameFile = "";

		function streamMerge() {
			if (videoStreamDone && audioStreamDone) {
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
						const stream = createReadStream(nameFile)
							.on("error", () => {
								unlink(nameFile, () => {});
								reject();
								stream.destroy();
							})
							.on("close", () => {
								unlink(nameFile, () => {});
							})
							.on("open", () => {
								resolve(stream.pause());
							});
					});
			}
		}

		if (isOneChannel(itemInfo)) {
			fetch(itemInfo.url)
				.then((res) => {
					if (res.ok) {
						resolve(res.body);
					} else {
						reject();
					}
					return 0; // tocheck
				})
				.catch((err: Error) => reject(err));
		} else if (isMultiChannel(itemInfo)) {
			videoExt = itemInfo.video.ext;
			audioExt = itemInfo.audio.ext;
			videoNameFile = `${BASE_PATH}${cleanString(
				itemInfo.name,
			)}_video.${cleanString(videoExt)}`;
			audioNameFile = `${BASE_PATH}${cleanString(
				itemInfo.name,
			)}_audio.${cleanString(audioExt)}`;

			fetch(itemInfo.video.url)
				.then((respVideo) => {
					// eslint-disable-next-line promise/always-return
					if (respVideo.ok) {
						// eslint-disable-next-line promise/no-nesting
						fetch(itemInfo.audio.url)
							.then((respAudio) => {
								if (respAudio) {
									respVideo.body
										.pipe(
											createWriteStream(videoNameFile)
												.on("finish", () => {
													videoStreamDone = true;
													streamMerge();
												})
												.on("error", (err: Error) => {
													reject(err);
												}),
										)
										.on("error", (err: Error) => {
											reject(err);
										});

									respAudio.body
										.pipe(
											createWriteStream(audioNameFile)
												.on("finish", () => {
													audioStreamDone = true;
													streamMerge();
												})
												.on("error", (err: Error) => {
													reject(err);
												}),
										)
										.on("error", (err: Error) => {
											reject(err);
										});
								} else {
									reject();
								}
								return 0; // tocheck
							})
							.catch((err: Error) => reject(err));
					} else {
						reject();
					}
				})
				.catch((err: Error) => reject(err));
		} else {
			throw new Error("Invalid item info");
		}
	});
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
