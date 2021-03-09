import Stream from "stream";

export interface ZipStream {
	finish(): void;
	pause(): ZipStream;
	on(trigger: string, callback: (arg?: any) => void): ZipStream;
	entry(
		stream: NodeJS.ReadableStream,
		{ name }: { name: string },
		callback: (err: Error) => void,
	): void;
	resume(): ZipStream;
	pipe(x: Stream.Writable): ZipStream;
}
