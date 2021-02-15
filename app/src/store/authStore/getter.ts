import { AuthError, DataNotFoundError } from "@/errors/restartError";
import { StoreState } from "@/store";
import Auth from "@/User/Auth";
import { GetterTree } from "vuex";
import { AuthStoreState } from "./state";

export type GettersType = {
	auth(state: AuthStoreState): Auth;
	token(state: AuthStoreState): string;
	refreshToken(state: AuthStoreState): string;
	isConnected(state: AuthStoreState): boolean;
};

export const Getters: GetterTree<AuthStoreState, StoreState> & GettersType = {
	auth(state: AuthStoreState): Auth {
		if (!state.rawAuth) {
			throw new DataNotFoundError("Auth is undefined");
		}
		return state.rawAuth;
	},

	token(state: AuthStoreState): string {
		if (!state.rawToken) {
			return "";
			// throw new AuthError("undefined token");
		}
		return state.rawToken;
	},
	refreshToken(state: AuthStoreState): string {
		if (!state.rawRefreshToken) {
			throw new AuthError("undefined refresh token");
		} else {
			return state.rawRefreshToken;
		}
	},

	isConnected(state: AuthStoreState): boolean {
		if (state.rawToken && state.rawRefreshToken) {
			return true;
		}
		return false;
	},
};
