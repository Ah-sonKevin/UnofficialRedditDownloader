import { RedditRawData } from "../object/redditDataInterface";
export interface rawItem {
  data: {
    children: {
      kind: string;
      data: RedditRawData;
    }[];
    after: string;
  };
}
