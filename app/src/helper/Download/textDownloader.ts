import { PostType } from "@/enum/postType";
import { SavedContentType, Textual } from "../../savedContent/ISavedContent";

export function getText(item: SavedContentType & Textual): string {
	// tocheck type
	const parser = new DOMParser();

	const parsedContent = parser.parseFromString(item.getHtmlText(), "text/html");
	const stringContent = parsedContent.documentElement.textContent;

	let res = "";
	if (item.type === PostType.COMMENT) {
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

export function downloadPageAsText(item: SavedContentType & Textual): Blob {
	const res = getText(item);
	return new Blob([res]);
}
