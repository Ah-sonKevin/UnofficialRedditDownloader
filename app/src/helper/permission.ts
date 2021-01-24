import Auth from "@/object/Auth";
import { AUTH_ID, AUTH_SECRET } from "./redditAppsIDs";

export default {
  createAuthData(): Auth {
    // eslint-disable-next-line no-magic-numbers
    const AUTH_STRING = Math.random().toString(36);
    localStorage.setItem("AUTH_STRING", AUTH_STRING);
    const AUTH_SCOPE = "save identity history";

    const AUTH_REDIRECT =
      "http://" + window.location.hostname + ":8080" + "/Login";

    const AUTH_LINK = `https://www.reddit.com/api/v1/authorize?client_id=${AUTH_ID}&response_type=code&
state=${AUTH_STRING}&redirect_uri=${AUTH_REDIRECT}&duration=permanent&scope=${AUTH_SCOPE}`;

    localStorage.setItem("AUTH_SECRET", AUTH_SECRET);
    return new Auth(
      AUTH_ID,
      AUTH_STRING,
      AUTH_SCOPE,
      AUTH_REDIRECT,
      AUTH_SECRET,
      AUTH_LINK
    );
  }
};
//later readme
//later support me
//later explanation token
