import { R_NetworkError } from "@/errors/restartError";
import { buildContent } from "@/object/contentBuilder";
import SavedContent from "@/object/savedContent";
import User from "@/object/User";
import { Couple } from "./couple";
import { fetchOapi, postOapi } from "./fetchHelper";
import { RawItem, RawItemUnit } from "./rawItemInterface";

export async function recGetSave(
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
		throw new R_NetworkError(res.statusText);
	}

	const result: RawItem = (await res.json()) as RawItem;
	result.data.children.forEach((el: RawItemUnit) => {
		buildContent(el)
			.then(item => items.push(item))
			.catch(err => {
				throw err;
			});
	});
	if (result.data.after) {
		// todo return recGetSave(username, result.data.after, items);
		return items;
	}
	return items;
}

export async function fetchUser(): Promise<User> {
	const userRes = await fetchOapi("/api/v1/me");
	if (userRes.ok) {
		return userRes.json().then(userData => {
			const user = new User(userData);
			return user;
		});
	}
	throw new R_NetworkError(userRes.statusText);
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
	// later
	const res = await fetchOapi("/api/saved_categories");
	if (res.ok) {
		return res.json().then(() => []);
	}
	return [];
}

export function unsave(toDelete: SavedContent): void {
	toDelete.isDeleted = true;
	void postOapi("/api/unsave", [new Couple("id", toDelete.fullname)]);
}

export function unsaveArray(toDelete: SavedContent[]): void {
	toDelete.forEach(el => {
		unsave(el);
	});
}

export function save(toDelete: SavedContent): void {
	toDelete.isDeleted = false;
	void postOapi("/api/save", [new Couple("id", toDelete.fullname)]);
}

export function saveArray(toDelete: SavedContent[]): void {
	toDelete.forEach(el => {
		save(el);
	});
}
