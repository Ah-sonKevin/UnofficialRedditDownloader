import { AuthError, DataNotFoundError } from "@/errors/restartError";
import Auth from "@/User/Auth";
import { Module, Mutation, VuexModule } from "vuex-module-decorators";

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
	setAuth(a: Auth): void {
		this.rawAuth = a;
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
