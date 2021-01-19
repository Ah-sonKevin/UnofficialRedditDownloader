import { R_AuthError, R_NetworkError } from "@/errors/error";
import AuthStore from "@/store/authStore";
import { useStore } from "vuex";
import { getModule } from "vuex-module-decorators";
import { Couple } from "./couple";
import { postOapi, postRedditAPI } from "./fetchHelper";

export class CodeTruple {
  state: string;
  code: string;
  error?: string;

  constructor(_state: string, _code: string, _error?: string) {
    this.state = _state;
    this.code = _code;
    this.error = _error;
  }
}

export function resetToken(): void {
  const authModule = getModule(AuthStore, useStore());
  postOapi("/api/v1/revoke_token", [
    new Couple("token", authModule.token),
    new Couple("token_type_hint", "access_token")
  ]);
  postOapi("/api/v1/revoke_token", [
    new Couple("token", authModule.refreshToken),
    new Couple("token_type_hint", "refresh_token")
  ]);
  authModule.resetToken();
}

export async function generateAccessToken(received: CodeTruple): Promise<void> {
  const authModule = getModule(AuthStore, useStore());
  if (
    received.error ||
    received.state !== authModule.auth.AUTH_STRING ||
    !received.code
  ) {
    throw new R_AuthError(
      `Error: ${received.error},  State:${received.state} = ${authModule.auth.AUTH_STRING},  Code:${received.code}`
    );
  }
  const tokenBody = `grant_type=authorization_code&code=${received.code}&redirect_uri=${authModule.auth.AUTH_REDIRECT}`;
  const result: Response = await postRedditAPI(
    "/api/v1/access_token",
    tokenBody
  );
  if (result.ok) {
    const res = await result.json();
    authModule.setToken(res.access_token as string);
    authModule.setRefreshToken(res.refresh_token as string);
  } else {
    throw new R_NetworkError(result.statusText);
  }
}
