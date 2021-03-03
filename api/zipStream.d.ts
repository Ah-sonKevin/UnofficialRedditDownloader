import Stream from "stream";

declare class ZipStream extends Stream.Transform {
	constructor({ store: boolean, zlib: { level: number } }): ZipStream;
	Packer({ store: boolean, zlib: { level: number } }): ZipStream;
	finish(): void;
	pause(): ZipStream;
	on(trigger: string, callback: (arg?: any) => void): ZipStream;
	entry(
		stream: NodeJS.ReadableStream,
		{ name }: { name: string },
		callback: (err: Error) => void,
	): void;
	resume(): ZipStream;
}
