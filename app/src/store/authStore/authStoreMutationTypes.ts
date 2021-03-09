import Auth from "@/User/Auth";
import { MutationTree } from "vuex";
import { AuthStoreState } from "./state";

export enum MutationsNames {
	SET_AUTH = "SET_AUTH",
	RESET_TOKEN = "RESET_TOKEN",
	SET_TOKEN = "SET_TOKEN",
	SET_REFRESH_TOKEN = "SET_REFRESH_TOKEN",
	CREATE_AUTH_DATA = "CREATE_AUTH_DATA",
}

export type MutationsTypes<S = AuthStoreState> = {
	[MutationsNames.SET_TOKEN](state: S, token: string): void;
	[MutationsNames.SET_REFRESH_TOKEN](state: S, token: string): void;
	[MutationsNames.SET_AUTH](state: S, auth: Auth): void;
	[MutationsNames.RESET_TOKEN](state: S): void;
	[MutationsNames.CREATE_AUTH_DATA](state: S): void;
};

export const mutations: MutationTree<AuthStoreState> & MutationsTypes = {
	[MutationsNames.SET_AUTH](state: AuthStoreState, auth: Auth): void {
		state.rawAuth = auth;
	},

	[MutationsNames.RESET_TOKEN](state: AuthStoreState): void {
		state.rawToken = undefined;
		state.rawRefreshToken = undefined;
	},

	[MutationsNames.SET_TOKEN](state: AuthStoreState, token: string): void {
		state.rawToken = token;
	},
	[MutationsNames.SET_REFRESH_TOKEN](
		state: AuthStoreState,
		token: string,
	): void {
		state.rawRefreshToken = token;
	},
	[MutationsNames.CREATE_AUTH_DATA](state: AuthStoreState): void {
		const BASE = 36;
		const authString = Math.random().toString(BASE);
		const AUTH_SCOPE = "save identity history";

		const authRedirect = `http://${window.location.hostname}:8080/Login`;
		const authID: string = globalThis.AUTH_ID;
		const authSecret: string = globalThis.AUTH_SECRET;
		const authLink = `https://www.reddit.com/api/v1/authorize?client_id=${authID}&response_type=code&
				state=${authString}&redirect_uri=${authRedirect}&duration=permanent&scope=${AUTH_SCOPE}`;
		state.rawAuth = new Auth({
			id: authID,
			authString,
			scope: AUTH_SCOPE,
			redirects: authRedirect,
			secret: authSecret,
			link: authLink,
		});
	},
};
