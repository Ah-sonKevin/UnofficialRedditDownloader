import { NetworkError } from "@/errors/restartError";
import { SavedContentType } from "@/savedContent/ISavedContent";
import { buildContent } from "@/savedContent/ItemBuilder/contentBuilder";
import User from "@/User/User";
import { PartialRedditFetchError } from "../errors/notifError";
import { isRawItem, RawItemUnit } from "../savedContent/rawItemInterface";
import itemsLong from "../tests/units/mockFetchData/soloItemLong.json";
import { fetchOapi, postOapi } from "./fetchHelper/fetchHelper";
import { Couple } from "./fetchHelper/requestArgument";
import { logger } from "./logger";

export async function recGetItems(
	username: string,
	after = "",
	items: SavedContentType[] = [],
): Promise<SavedContentType[]> {
	let afterParam = "";
	if (after) {
		afterParam = `&after=${after}`;
	}
	const res = await fetchOapi(`/user/${username}/saved?limit=100${afterParam}`);
	if (!res.ok) {
		throw new NetworkError(res.statusText);
	}
	// const result: unknown = await res.json();
	const result: unknown = itemsLong;
	if (!isRawItem(result)) {
		throw new Error("Invalid Result");
	}

	result.data.children.forEach((el: RawItemUnit) => {
		buildContent(el)
			.then((item) => items.push(item))
			.catch((err: Error) => {
				logger.error(
					`${err.message} \n\n${err.stack ?? "NO STACK"}\n\n ${JSON.stringify(
						el,
					)}  ${JSON.stringify(el)}`,
				);
				console.log(err);
				throw new PartialRedditFetchError(
					`PartialRedditFetchError  ${el.data.name}`,
				);
			});
	});
	if (result.data.after) {
		return recGetItems(username, result.data.after, items);
	}
	console.log("///");
	console.log(JSON.stringify(items));
	return [];
	// todo return items;
}

export async function fetchUser(): Promise<User> {
	const userRes = await fetchOapi("/api/v1/me");
	if (userRes.ok) {
		return userRes.json().then((userData) => {
			const user = new User(userData);
			return user;
		});
	}
	throw new NetworkError(userRes.statusText);
}

export function setSubredditList(items: SavedContentType[]): string[] {
	const listSub: string[] = [];
	items.forEach((post: SavedContentType) => {
		if (!listSub.includes(post.subreddit)) {
			listSub.push(post.subreddit);
		}
	});

	return listSub;
}

export async function fetchCategories(): Promise<string[]> {
	// nextRelease make Fetch categories
	const res = await fetchOapi("/api/saved_categories");
	if (res.ok) {
		const categories = res.json() as Promise<string[]>;
		return categories;
	}
	return [];
}

export function unsave(toDelete: SavedContentType): void {
	toDelete.isDeleted = true;
	void postOapi("/api/unsave", [new Couple("id", toDelete.fullname)]);
}

export function unsaveArray(toDelete: SavedContentType[]): void {
	toDelete.forEach((el) => {
		unsave(el);
	});
}

export function save(toDelete: SavedContentType): void {
	toDelete.isDeleted = false;
	void postOapi("/api/save", [new Couple("id", toDelete.fullname)]);
}

export function saveArray(toDelete: SavedContentType[]): void {
	toDelete.forEach((el) => {
		save(el);
	});
}
