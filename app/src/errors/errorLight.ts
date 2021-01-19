export class R_ErrorLight extends Error {
  constructor(msg: string) {
    super(msg);
  }
  html = false;
  redirect = false;
  popup = false;
  title = "";
}

export class R_UnauthorizedAccess extends R_ErrorLight {
  constructor() {
    super("You need to be connect to access this page");
  }
  redirect = true;
}

export class R_DownloadError extends R_ErrorLight {
  constructor() {
    super("");
  }
  popup = true;
}

export class R_PartialDownloadError extends R_ErrorLight {
  html = true;
  constructor(arrays: {
    success: { path: string; name: string }[];
    fail: { path: string; name: string }[];
  }) {
    super("");
    if (arrays.success.length === 0) {
      this.message = "The files couldn't be downloaded";
      this.title = "Files couldn't be downloaded";
    } else if (arrays.fail.length > 0) {
      if (arrays.fail.length === 1) {
        this.message = "The file " + arrays.fail[0] + " couldn't be downloaded";
        this.title = "A file couldn't be downloaded";
      } else {
        this.message = "The following files couldn't be downloaded \n<ul>";
        arrays.fail.forEach(el => {
          this.message += "<li>" + el + "</li>";
        });
        this.message += "</ul>";
        this.title = "Some files couldn't be downloaded";
      }
    }
  }
  popup = true;
}
