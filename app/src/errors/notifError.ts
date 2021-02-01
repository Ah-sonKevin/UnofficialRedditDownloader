import { R_Error } from "./error";

export class R_NotifError extends R_Error {
	constructor(msg: string) {
		super(msg);
	}
}

export class R_PartialDownloadError extends R_NotifError {
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
