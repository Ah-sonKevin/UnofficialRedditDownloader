import { sorter } from "@/enum/sorter";
import { SavedContentType } from "@/savedContent/ISavedContent";

export function getSortedContent(
	content: SavedContentType[],
	selectedSorter: string,
): SavedContentType[] {
	switch (selectedSorter) {
		case sorter.ADDED_DATE:
			return content;
		case sorter.TITLE:
			return content.sort((el1, el2) => el1.title.localeCompare(el2.title));

		case sorter.AUTHOR:
			return content.sort((el1: SavedContentType, el2: SavedContentType) =>
				el1.author.localeCompare(el2.author),
			);

		case sorter.CREATION_DATE:
			return content.sort((el1: SavedContentType, el2: SavedContentType) => {
				if (el1.creationDate < el2.creationDate) {
					return -1;
				}
				if (el1.creationDate > el2.creationDate) {
					return 1;
				}
				return 0;
			});
		case sorter.SUBREDDIT:
			return content.sort((el1: SavedContentType, el2: SavedContentType) =>
				el1.subreddit.localeCompare(el2.subreddit),
			);
		default:
			return content.sort();
	}
}
