import { R_Error } from "./error";

export class R_RestartError extends R_Error {
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

export class R_AuthError extends R_RestartError {
  constructor(msg: string) {
    super(msg);
    this.nameError = "Authentication Error";
  }
}

export class R_UnauthorizedAccess extends R_RestartError {
  constructor() {
    super("You need to be connect to access this page");
  }
}

export class R_NetworkError extends R_RestartError {
  constructor(msg: string) {
    super(msg);
    this.nameError = "Network Error";
  }
}
export class R_BadLinkError extends R_RestartError {
  //tocheck
  constructor(msg: string) {
    super(msg);
    this.nameError = "Bad Link Error";
  }
}

export class R_UnknowTypeError extends R_RestartError {
  //todo sendError
  constructor(msg: string) {
    super(msg);
    this.nameError = "Unknow type Error";
  }
}

export class R_DataNotFoundError extends R_RestartError {
  //tocheck
  constructor(msg: string) {
    super(msg);
    this.nameError = "Data not found Error";
  }
}

export class R_DownloadError extends R_RestartError {
  constructor() {
    super("");
  }
}
