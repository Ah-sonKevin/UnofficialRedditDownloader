import { R_AuthError, R_DataNotFoundError } from "@/errors/error";
import Auth from "@/object/Auth";
import { Module, Mutation, VuexModule } from "vuex-module-decorators";

//@Module({ dynamic: true, store, name: 'auth', preserveState: true })
@Module({ name: "auth" })
export default class AuthStore extends VuexModule {
  _auth?: Auth;
  _token?: string;
  _refreshToken?: string;

  get auth(): Auth {
    if (!this._auth) {
      throw new R_DataNotFoundError("Auth is undefined");
    }
    return this._auth;
  }

  @Mutation
  setAuth(a: Auth): void {
    this._auth = a;
  }

  @Mutation
  resetToken(): void {
    this._token = undefined;
    this._refreshToken = undefined;
  }

  @Mutation
  setToken(token: string): void {
    this._token = token;
  }

  get token(): string {
    if (!this._token) {
      throw new R_AuthError("undefined token");
    } else {
      return this._token;
    }
  }

  @Mutation
  setRefreshToken(token: string): void {
    this._refreshToken = token;
  }

  get refreshToken(): string {
    if (!this._refreshToken) {
      throw new R_AuthError("undefined refresh token");
    } else {
      return this._refreshToken;
    }
  }

  get isConnected(): boolean {
    if (this._token && this._refreshToken) {
      return true;
    }
    return false;
  }
}
