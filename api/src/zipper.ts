export { }; //todo needed for module with its own scope
const Packer = require("zip-stream");
import Stream from "stream";
import { serverLogger } from "./logger";

export default class Zipper {
	archive;

  toZipList: {
    stream: NodeJS.ReadableStream,
    name: string,
    promise: () => void,
    reject: (err: Error) => void,
  }[]  = [];

	failArray: string[]  = [];

	fileArray: {name:string}[] = [];

	zipping = false;

  constructor() {
     this.archive = new Packer({ store: true, zlib: { level: 0 } }).pause();
    
	}

	addStream(stream:NodeJS.ReadableStream, nameFile: string, promise: () => void, reject: (err: Error) => void) {
		stream.on("error", (err :Error) => {
			this.failArray.push(nameFile);
      reject(err);  
		});

		if (this.zipping) {
			this.toZipList.push({
				stream,
				name: nameFile,
				promise,
				reject,
			});
		} else {
			this.zipping = true;
			this.toZipList.push({
				stream,
				name: nameFile,
				promise,
				reject,
			});

			this.startZip();
		}
	}

	addDownloadFail(item:{name:string}, message:string) {
		serverLogger.error(message);
		this.failArray.push(item.name);
	}

	endArchive() {
		const stream = new Stream.Readable();
		stream.on("error", (err: Error) => console.log(err));
		stream.push(
			JSON.stringify({ success: this.fileArray, fail: this.failArray })
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

	getArchive() {
		return this.archive;
	}

	startZip() {
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
						el.promise();
					} else {
						el.reject(new Error('Compression Error'));
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
