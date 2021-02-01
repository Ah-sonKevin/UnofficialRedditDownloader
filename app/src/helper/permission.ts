import Auth from "@/object/Auth";
import { AUTH_ID, AUTH_SECRET } from "./redditAppsIDs";

export default {
	createAuthData(): Auth {
		// todo
		// eslint-disable-next-line no-magic-numbers
		const authString = Math.random().toString(36);
		localStorage.setItem("authString", authString);
		const AUTH_SCOPE = "save identity history";

		const authRedirect = `http://${window.location.hostname}:8080/Login`;

		const authLink = `https://www.reddit.com/api/v1/authorize?client_id=${AUTH_ID}&response_type=code&
state=${authString}&redirect_uri=${authRedirect}&duration=permanent&scope=${AUTH_SCOPE}`;

		localStorage.setItem("AUTH_SECRET", AUTH_SECRET);
		return new Auth(
			AUTH_ID,
			authString,
			AUTH_SCOPE,
			authRedirect,
			AUTH_SECRET,
			authLink,
		);
	},
};
// later readme
// later support me
// later explanation token
