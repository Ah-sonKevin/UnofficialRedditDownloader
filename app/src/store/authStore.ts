import { AuthError, DataNotFoundError } from "@/errors/restartError";
import Auth from "@/User/Auth";
import { Module, Mutation, VuexModule } from "vuex-module-decorators";
import { AUTH_ID, AUTH_SECRET } from "../info/secret/redditAppsIDs";

// @Module({ dynamic: true, store, name: 'auth', preserveState: true })
@Module({ name: "auth" })
export default class AuthStore extends VuexModule {
	rawAuth?: Auth;

	rawToken?: string;

	rawRefreshToken?: string;

	get auth(): Auth {
		if (!this.rawAuth) {
			throw new DataNotFoundError("Auth is undefined");
		}
		return this.rawAuth;
	}

	@Mutation
	createAuthData(): void {
		// eslint-disable-next-line no-magic-numbers
		const authString = Math.random().toString(36);
		const AUTH_SCOPE = "save identity history";

		const authRedirect = `http://${window.location.hostname}:8080/Login`;

		const authLink = `https://www.reddit.com/api/v1/authorize?client_id=${AUTH_ID}&response_type=code&
			state=${authString}&redirect_uri=${authRedirect}&duration=permanent&scope=${AUTH_SCOPE}`;
		this.rawAuth = new Auth(
			AUTH_ID,
			authString,
			AUTH_SCOPE,
			authRedirect,
			AUTH_SECRET,
			authLink,
		);
	}

	@Mutation
	resetToken(): void {
		this.rawToken = undefined;
		this.rawRefreshToken = undefined;
	}

	@Mutation
	setToken(token: string): void {
		this.rawToken = token;
	}

	get token(): string {
		if (!this.rawToken) {
			throw new AuthError("undefined token");
		} else {
			return this.rawToken;
		}
	}

	@Mutation
	setRefreshToken(token: string): void {
		this.rawRefreshToken = token;
	}

	get refreshToken(): string {
		if (!this.rawRefreshToken) {
			throw new AuthError("undefined refresh token");
		} else {
			return this.rawRefreshToken;
		}
	}

	get isConnected(): boolean {
		if (this.rawToken && this.rawRefreshToken) {
			return true;
		}
		return false;
	}
}
