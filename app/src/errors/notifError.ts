import { SuccessList } from "@/savedContent/ItemInterface";
import { RedditManagerError } from "./error";

export class NotifError extends RedditManagerError {}

export class PartialDownloadError extends NotifError {
	success: string[];

	fail: string[];

	constructor(arrays: SuccessList) {
		super("");
		this.success = arrays.success;
		this.fail = arrays.fail;
	}
}

export class DownloadError extends NotifError {}

export class PartialRedditFetchError extends NotifError {
	constructor(name: string) {
		super("");
	}
}
