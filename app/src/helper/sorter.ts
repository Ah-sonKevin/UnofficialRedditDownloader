import { sorter } from "@/enum/sorter";
import SavedContent from "@/object/savedContent";

export function getSortedContent(
  content: SavedContent[],
  selectedSorter: string
): SavedContent[] {
  switch (selectedSorter) {
    case sorter.ADDED_DATE:
      return content;
    case sorter.TITLE:
      return content.sort((el1, el2) => {
        return el1.title.localeCompare(el2.title);
      });

    case sorter.AUTHOR:
      return content.sort((el1: SavedContent, el2: SavedContent) => {
        return el1.author.localeCompare(el2.author);
      });

    case sorter.CREATION_DATE:
      return content.sort((el1: SavedContent, el2: SavedContent) => {
        if (el1.creationDate < el2.creationDate) {
          return -1;
        } else if (el1.creationDate > el2.creationDate) {
          return 1;
        } else {
          return 0;
        }
      });
    case sorter.SUBREDDIT:
      return content.sort((el1: SavedContent, el2: SavedContent) => {
        return el1.subreddit.localeCompare(el2.subreddit);
      });
    default:
      return content.sort();
  }
}
