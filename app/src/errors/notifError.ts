import { RedditManagerError } from "./error";

export class NotifError extends RedditManagerError {}

export class PartialDownloadError extends NotifError {
	success: { path: string; name: string }[];

	fail: { path: string; name: string }[];

	constructor(arrays: {
		success: { path: string; name: string }[];
		fail: { path: string; name: string }[];
	}) {
		super("");
		this.success = arrays.success;
		this.fail = arrays.fail;
	}
}

export class PartialRedditFetchError extends NotifError {
	constructor(name: string) {
		super("");
	}
}
