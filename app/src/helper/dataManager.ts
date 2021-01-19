import { R_NetworkError } from "@/errors/error";
import { buildContent } from "@/object/contentBuilder";
import SavedContent from "@/object/savedContent";
import User from "@/object/User";
import { Couple } from "./couple";
import { fetchOapi, postOapi } from "./fetchHelper";

export async function recGetSave(
  username: string,
  after = "",
  items: SavedContent[] = []
): Promise<SavedContent[]> {
  let afterParam = "";
  if (after) {
    afterParam = `&after=${after}`;
  }
  const res = await fetchOapi(`/user/${username}/saved?limit=100${afterParam}`);
  if (!res.ok) {
    throw new R_NetworkError(res.statusText);
  }

  const result = await res.json();
  result.data.children.forEach(async function(el: {
    kind: string;
    data: unknown;
  }) {
    const item = await buildContent(el);
    items.push(item);
  });
  if (result.data.after) {
    return recGetSave(username, result.data.after, items);
  } else {
    return items;
  }
}

export async function fetchUser(): Promise<User> {
  const userRes = await fetchOapi("/api/v1/me");
  if (userRes.ok) {
    return userRes.json().then(userData => {
      const user = new User(userData);
      return user;
    });
  } else {
    throw new R_NetworkError(userRes.statusText);
  }
}
//tocheck file
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
  const res = await fetchOapi("/api/saved_categories");
  if (res.ok) {
    return res.json().then(json => json);
  } else {
    return [];
  }
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
