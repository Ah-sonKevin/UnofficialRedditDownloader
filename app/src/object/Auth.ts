export default class Auth {
  AUTH_ID: string;
  AUTH_STRING: string;
  AUTH_SCOPE: string;
  AUTH_REDIRECT: string;
  AUTH_SECRET: string;
  AUTH_LINK: string;
  AUTH_AUTHORIZATION: string;

  constructor(
    id: string,
    authString: string,
    scope: string,
    redirects: string,
    secret: string,
    link: string
  ) {
    this.AUTH_ID = id;
    this.AUTH_STRING = authString;
    this.AUTH_SCOPE = scope;
    this.AUTH_REDIRECT = redirects;
    this.AUTH_SECRET = secret;
    this.AUTH_LINK = link;
    this.AUTH_AUTHORIZATION = btoa(`${this.AUTH_ID}:${this.AUTH_SECRET}`);
  }

  string(): string {
    return this.AUTH_ID;
  }
}
