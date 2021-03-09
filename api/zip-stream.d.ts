import Stream from "stream";
/*
declare module "zip-stream" {
	export = ZipStream;
} */
//  why '=' ?

declare module "zip-stream" {
	declare class ZipStreamExternal extends Stream.Transform {
		constructor({
			store,
			zlib: { level },
		}: {
			store: boolean;
			zlib: { level: number };
		}): ZipStreamExternal;
		finish(): void;
		pause(): ZipStreamExternal;
		on(trigger: string, callback: (arg?: any) => void): ZipStreamExternal;
		entry(
			stream: NodeJS.ReadableStream,
			{ name }: { name: string },
			callback: (err: Error) => void,
		): void;
		resume(): ZipStreamExternal;
		pipe(x: Stream.Writable): ZipStream;
	}
	export = ZipStreamExternal;
}
