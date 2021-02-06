import { RedditManagerError } from "./error";

export class RestartError extends RedditManagerError {
	preMessage = "";

	popupMessage: string;

	postErrorTxt = "";

	nameError: string;

	constructor(msg: string) {
		super(msg);
		this.popupMessage = this.preMessage + msg + this.postErrorTxt;
		this.nameError = "";
	}
}

export class AuthError extends RestartError {
	constructor(msg: string) {
		super(msg);
		this.nameError = "Authentication Error";
	}
}

export class UnauthorizedAccess extends RestartError {
	constructor() {
		super("You need to be connect to access this page");
	}
}

export class NetworkError extends RestartError {
	constructor(msg: string) {
		super(msg);
		this.nameError = "Network Error";
	}
}
export class BadLinkError extends RestartError {
	constructor(msg: string) {
		super(msg);
		this.nameError = "Bad Link Error";
	}
}

export class UnknowTypeError extends RestartError {
	constructor(msg: string) {
		super(msg);
		this.nameError = "Unknow type Error";
	}
}

export class DataNotFoundError extends RestartError {
	constructor(msg: string) {
		super(msg);
		this.nameError = "Data not found Error";
	}
}

export class DownloadError extends RestartError {
	constructor() {
		super("");
	}
}
