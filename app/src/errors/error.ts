export class R_Error extends Error {
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

export class R_AuthError extends R_Error {
  constructor(msg: string) {
    super(msg);
    this.nameError = "Authentication Error";
  }
}

export class R_NetworkError extends R_Error {
  constructor(msg: string) {
    super(msg);
    this.nameError = "Network Error";
  }
}
export class R_BadLinkError extends R_Error {
  constructor(msg: string) {
    super(msg);
    this.nameError = "Bad Link Error";
  }
}

export class R_UnknowTypeError extends R_Error {
  constructor(msg: string) {
    super(msg);
    this.nameError = "Unknow type Error";
  }
}
export class R_DataNotFoundError extends R_Error {
  constructor(msg: string) {
    super(msg);
    this.nameError = "Data not found Error";
  }
}
