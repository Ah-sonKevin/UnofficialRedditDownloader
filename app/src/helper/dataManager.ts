import { NetworkError } from "@/errors/restartError";
import { buildContent } from "@/savedContent/ItemBuilder/contentBuilder";
import SavedContent from "@/savedContent/savedContent";
import User from "@/User/User";
import { PartialRedditFetchError } from "../errors/notifError";
import { RawItem, RawItemUnit } from "../savedContent/rawItemInterface";
import { fetchOapi, postOapi } from "./fetchHelper/fetchHelper";
import { Couple } from "./fetchHelper/requestArgument";
import { logger } from "./logger";

export async function recGetItems(
	username: string,
	after = "",
	items: SavedContent[] = [],
): Promise<SavedContent[]> {
	let afterParam = "";
	if (after) {
		afterParam = `&after=${after}`;
	}
	const res = await fetchOapi(`/user/${username}/saved?limit=100${afterParam}`);
	if (!res.ok) {
		throw new NetworkError(res.statusText);
	}
	const result: unknown = await res.json();
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
				throw new PartialRedditFetchError(el.data.name);
			});
	});
	if (result.data.after) {
		return recGetItems(username, result.data.after, items);
	}
	return items;
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

export function setSubredditList(items: SavedContent[]): string[] {
	const listSub: string[] = [];
	items.forEach((post: SavedContent) => {
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

export function unsave(toDelete: SavedContent): void {
	toDelete.isDeleted = true;
	void postOapi("/api/unsave", [new Couple("id", toDelete.fullname)]);
}

export function unsaveArray(toDelete: SavedContent[]): void {
	toDelete.forEach((el) => {
		unsave(el);
	});
}

export function save(toDelete: SavedContent): void {
	toDelete.isDeleted = false;
	void postOapi("/api/save", [new Couple("id", toDelete.fullname)]);
}

export function saveArray(toDelete: SavedContent[]): void {
	toDelete.forEach((el) => {
		save(el);
	});
}
