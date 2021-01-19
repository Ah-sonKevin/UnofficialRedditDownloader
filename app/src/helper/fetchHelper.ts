import { R_DataNotFoundError, R_NetworkError } from "@/errors/error";
import { store } from "@/store";
import AuthStore from "@/store/authStore";
import { useRouter } from "vue-router";
import { getModule } from "vuex-module-decorators";
import { Couple } from "./couple";
import { fetchMethod } from "./fetchInterface";

const REDDIT_API = "https://www.reddit.com";
const OAUTH_API = "https://oauth.reddit.com";

function getRedditHeader(): Headers {
  const authModule = getModule(AuthStore, store);
  const authHeaders = new Headers();
  authHeaders.append(
    "Authorization",
    `Basic ${authModule.auth.AUTH_AUTHORIZATION}`
  );
  authHeaders.append("Content-Type", "application/x-www-form-urlencoded");
  return authHeaders;
}

export async function postRedditAPI(
  endpoint: string,
  grant: string
): Promise<Response> {
  const authHeaders = getRedditHeader();
  const myInit = {
    method: "POST",
    headers: authHeaders,
    body: grant
  };

  const request = new Request(`${REDDIT_API}${endpoint}`, myInit);
  return await fetch(request);
}

function getOauthHeader(): Headers {
  const authModule = getModule(AuthStore, store);
  const authHeaders = new Headers();
  const API_TOKEN = authModule.token;
  authHeaders.append("Authorization", `Bearer ${API_TOKEN}`);
  authHeaders.append("Content-Type", "application/x-www-form-urlencoded");

  return authHeaders;
}

export async function refreshAccessToken(): Promise<void> {
  const authModule = getModule(AuthStore, store);
  const refreshToken = authModule.refreshToken;
  let tokenBody: string;

  if (refreshToken) {
    tokenBody = `grant_type=refresh_token&refresh_token=${refreshToken}`;
    const result = await postRedditAPI("/api/v1/access_token", tokenBody);
    if (result.ok) {
      const res = await result.json();
      const API_TOKEN: string = res.access_token;
      authModule.setToken(API_TOKEN);
    } else {
      authModule.resetToken();
      useRouter().push({ name: "Home" });
    }
  } else {
    throw new R_DataNotFoundError("Refresh Token Not Found ");
  }
}

export async function fetchOapi(
  endpoint: string,
  retry = false
): Promise<Response> {
  const init = {
    method: "GET",
    headers: getOauthHeader()
  };
  const request = new Request(`${OAUTH_API}${endpoint}`, init);
  const response = await fetch(request);
  if (!response.ok) {
    if (response.status === 401 && !retry) {
      console.error(response);
      await refreshAccessToken();
      return fetchOapi(endpoint, true);
    } else {
      throw new R_NetworkError(response.statusText);
    }
  } else {
    return response;
  }
}

export async function postOapi(
  endpoint: string,
  args: Couple[],
  retry = false
): Promise<any> {
  const authHeaders = getOauthHeader();
  let body = "";
  for (let i = 0; i < args.length; i++) {
    body += `${args[i].key}=${args[i].value}`;
    if (i !== args.length - 1) body += "&";
  }

  const myInit = {
    method: "POST",
    headers: authHeaders,
    body: body
  };

  const request = new Request(`${OAUTH_API}${endpoint}`, myInit);
  const response = await fetch(request);
  if (!response.ok) {
    if (response.status === 401) {
      if (!retry) {
        console.error(response);
        await refreshAccessToken();
        return postOapi(endpoint, args, true);
      } else {
        throw new R_NetworkError("Refresh Token Error");
      }
    } else {
      throw new R_NetworkError(response.statusText);
    }
  }
  const result = await response.json();
  return result;
}

export function fetchMedia(url: string, needYtDl = false): Promise<Response> {
  const authHeaders = new Headers();
  authHeaders.append("Content-Type", "application/x-www-form-urlencoded");
  return fetch("/api/downItem/", {
    method: fetchMethod.POST,
    body: `url=${url}&needYdl=${needYtDl}`,
    headers: authHeaders
  });
}

export function fetchBatchMediaInfo(
  urls: { url: string; name: string; needYtDl: boolean }[]
): Promise<Response> {
  const authHeaders = new Headers();
  authHeaders.append("Content-Type", "application/json");
  const jsonUrls = JSON.stringify(urls);
  return fetch("/api/downBatchInfo/", {
    method: fetchMethod.POST,
    body: jsonUrls,
    headers: authHeaders
  });
}

export function fetchBatchMediaFile(
  list: { path: string; name: string }[]
): Promise<Response> {
  const authHeaders = new Headers();
  authHeaders.append("Content-Type", "application/json");
  const jsonList = JSON.stringify(list);
  return fetch("/api/downBatchList/", {
    method: fetchMethod.POST,
    body: jsonList,
    headers: authHeaders
  });
}
