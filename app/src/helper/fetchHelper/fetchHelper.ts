import { DataNotFoundError, NetworkError } from "@/errors/restartError";
import { getRouter } from "@/router";
import { getTypedStore } from "@/store";
import "isomorphic-fetch";
import { MutationsNames } from "../../store/authStore/authStoreMutationTypes";
import { Couple } from "./requestArgument";

const REDDIT_API = "https://www.reddit.com";
export const OAUTH_API = "https://oauth.reddit.com";

function getRedditHeader(): Headers {
	const store = getTypedStore();
	const authHeaders = new Headers();
	authHeaders.append(
		"Authorization",
		`Basic ${store.getters.auth.AUTH_AUTHORIZATION}`,
	);
	authHeaders.append("Content-Type", "application/x-www-form-urlencoded");
	return authHeaders;
}

export function postRedditAPI(
	endpoint: string,
	grant: string,
): Promise<Response> {
	const authHeaders = getRedditHeader();
	const myInit = {
		method: "POST",
		headers: authHeaders,
		body: grant,
	};

	const request = new Request(`${REDDIT_API}${endpoint}`, myInit);
	return fetch(request);
}

function getOauthHeader(): Headers {
	const store = getTypedStore();
	const authHeaders = new Headers();
	const apiToken = store.getters.token;
	authHeaders.append("Authorization", `Bearer ${apiToken}`);
	authHeaders.append("Content-Type", "application/x-www-form-urlencoded");

	return authHeaders;
}

// eslint-disable-next-line max-statements
export async function refreshAccessToken(): Promise<void> {
	const store = getTypedStore();
	const refreshToken = store.getters.refreshToken;
	let tokenBody: string;

	if (refreshToken) {
		tokenBody = `grant_type=refresh_token&refresh_token=${refreshToken}`;
		const result = await postRedditAPI("/api/v1/access_token", tokenBody);
		if (result.ok) {
			const res = (await result.json()) as { access_token: string };
			const apiToken: string = res.access_token;
			store.commit(MutationsNames.SET_TOKEN, apiToken);
		} else {
			store.commit(MutationsNames.RESET_TOKEN, undefined);
			void getRouter().push({ name: "Home" });
		}
	} else {
		throw new DataNotFoundError("Refresh Token Not Found ");
	}
}

export async function fetchOapi(
	endpoint: string,
	retry = false,
): Promise<Response> {
	const init = {
		method: "GET",
		headers: getOauthHeader(),
	};
	// const request = new Request();
	const response = await fetch(`${OAUTH_API}${endpoint}`, init);
	if (!response.ok) {
		if (response.status === 401 && !retry) {
			await refreshAccessToken();
			return fetchOapi(endpoint, true);
		}
		throw new NetworkError(response.statusText);
	} else {
		return response;
	}
}

// eslint-disable-next-line max-statements
export async function postOapi( // todo limit api rate
	endpoint: string,
	args: Couple[],
	retry = false,
): Promise<unknown> {
	const authHeaders = getOauthHeader();
	let body = "";

	args.forEach((el, index) => {
		body += `${el.key}=${el.value}`;
		if (index !== args.length - 1) body += "&";
	});

	const myInit = {
		method: "POST",
		headers: authHeaders,
		body,
	};

	const request = new Request(`${OAUTH_API}${endpoint}`, myInit);
	const response = await fetch(request);
	if (!response.ok) {
		if (response.status === 401) {
			if (!retry) {
				await refreshAccessToken();
				return postOapi(endpoint, args, true);
			}
			throw new NetworkError("Refresh Token Error");
		} else {
			throw new NetworkError(response.statusText);
		}
	}
	const result: unknown = await response.json();
	return result;
}

export function fetchMedia(
	url: string,
	needYtDl = false,
	signal: AbortSignal,
): Promise<Response> {
	const authHeaders = new Headers();
	authHeaders.append("Content-Type", "application/x-www-form-urlencoded");
	const request = fetch("/api/downItem/", {
		method: "POST",
		body: `url=${url}&needYdl=${needYtDl}`,
		headers: authHeaders,
		signal,
	});
	return request;
}

export function fetchBatchMediaInfo(
	urls: { url: string; name: string; needYtDl: boolean }[],
	signal: AbortSignal,
): Promise<Response> {
	const authHeaders = new Headers();
	authHeaders.append("Content-Type", "application/json");
	const jsonUrls = JSON.stringify(urls);
	return fetch("/api/downBatchInfo/", {
		method: "POST",
		body: jsonUrls,
		headers: authHeaders,
		signal,
	});
}

export function fetchBatchMediaFile(
	list: { path: string; name: string }[],
): Promise<Response> {
	const authHeaders = new Headers();
	authHeaders.append("Content-Type", "application/json");
	const jsonList = JSON.stringify(list);
	return fetch("/api/downBatchList/", {
		method: "POST",
		body: jsonList,
		headers: authHeaders,
	});
}
