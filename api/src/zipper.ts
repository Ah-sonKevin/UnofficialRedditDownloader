import Stream from "stream";
import Packer from "zip-stream";
import { ZipStream } from "../zipStream";
import { clientLogger, serverLogger } from "./logger"; // todo needed for module with its own scope

export {};

export default class Zipper {
	archive: ZipStream;

	toZipList: {
		stream: NodeJS.ReadableStream;
		name: string;
		resolve: () => void;
		reject: (err: Error) => void;
	}[] = [];

	failArray: string[] = [];

	fileArray: { name: string }[] = [];

	zipping = false;

	constructor() {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-call
		this.archive = new Packer({
			store: true,
			zlib: { level: 0 },
		}) as ZipStream;
		this.archive.pause();
	}

	addStream({
		stream,
		nameFile,
		resolve,
		reject,
	}: {
		stream: NodeJS.ReadableStream;
		nameFile: string;
		resolve: () => void;
		reject: (err: Error) => void;
	}): void {
		stream.on("error", (err: Error) => {
			this.failArray.push(nameFile);
			reject(err);
		});

		if (this.zipping) {
			this.toZipList.push({
				stream,
				name: nameFile,
				resolve,
				reject,
			});
		} else {
			this.zipping = true;
			this.toZipList.push({
				stream,
				name: nameFile,
				resolve,
				reject,
			});

			this.startZip();
		}
	}

	addDownloadFail(item: { name: string }, message: string): void {
		serverLogger.error(message);
		this.failArray.push(item.name);
	}

	endArchive(): void {
		const stream = new Stream.Readable();
		stream.on("error", (err: Error) => clientLogger.error(err));
		stream.push(
			JSON.stringify({ success: this.fileArray, fail: this.failArray }),
		);
		stream.push(null);

		this.archive.entry(stream, { name: "result.json" }, (err: Error) => {
			if (err) {
				serverLogger.error({
					message: "compression error result.json",
					error: err,
				});
			}
			this.archive.finish();
		});
	}

	getArchive(): ZipStream {
		return this.archive;
	}

	startZip(): void {
		if (this.toZipList.length > 0) {
			let compressed = false;
			const el = this.toZipList[0];
			const name = el.name;
			const stream = el.stream
				.on("error", (err: Error) => {
					el.reject(err);
					this.failArray.push(name);
				})
				.on("close", () => {
					if (compressed) {
						el.resolve();
					} else {
						el.reject(new Error("Compression Error"));
					}
					this.toZipList.splice(0, 1);
					this.startZip();
				});
			this.archive.entry(stream, { name }, (err: Error) => {
				if (err) {
					compressed = false;
					this.failArray.push(name);
				} else {
					compressed = true;
					this.fileArray.push({
						name,
					});
				}
			});
		} else {
			this.zipping = false;
		}
	}
}

module.exports = Zipper;
