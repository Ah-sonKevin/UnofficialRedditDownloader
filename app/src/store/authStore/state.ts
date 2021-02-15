import Auth from "@/User/Auth";

export interface AuthStoreState {
	rawAuth?: Auth;
	rawToken?: string;
	rawRefreshToken?: string;
}

export const AuthState: AuthStoreState = {
	rawAuth: undefined,
	rawToken: undefined,
	rawRefreshToken: undefined,
};
