import { postType } from "@/enum/postType";
import { ISavedTextPost } from "@/savedContent/ISavedContent";

export function getText(item: ISavedTextPost): string {
	const parser = new DOMParser();

	const parsedContent = parser.parseFromString(item.text.htmlText, "text/html");
	const stringContent = parsedContent.documentElement.textContent;

	let res = "";
	if (item.type === postType.COMMENT) {
		res = `${item.redditUrl} \n\n A comment  by '${item.author}' of the post '${
			item.title
		}' by '${item.author}' from
         ${item.subreddit} at ${item.redditUrl} \n\n\n\n ${
			stringContent ?? ""
		}`;
	} else {
		res = `${item.redditUrl} \n\n ${item.title} by '${item.author}' from ${
			item.subreddit
		} at ${item.redditUrl} \n\n\n\n ${stringContent ?? ""}`;
	}
	return res;
}

export function downloadPageAsText(item: ISavedTextPost): Blob {
	const res = getText(item);
	return new Blob([res]);
}
