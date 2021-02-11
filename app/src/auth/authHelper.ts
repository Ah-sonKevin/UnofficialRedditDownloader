import { AuthError, NetworkError } from "@/errors/restartError";
import AuthStore from "@/store/authStore";
import { useStore } from "vuex";
import { getModule } from "vuex-module-decorators";
import { postOapi, postRedditAPI } from "../helper/fetchHelper/fetchHelper";
import { Couple } from "../helper/fetchHelper/requestArgument";

export class CodeTruple {
	state: string;

	code: string;

	error?: string;

	constructor(_state: string, _code: string, _error?: string) {
		this.state = _state;
		this.code = _code;
		this.error = _error;
	}
}
// todo secret type
export function resetToken(): void {
	const authModule = getModule(AuthStore, useStore());
	postOapi("/api/v1/revoke_token", [
		new Couple("token", authModule.token),
		new Couple("token_type_hint", "access_token"),
	])
		.then(() =>
			postOapi("/api/v1/revoke_token", [
				new Couple("token", authModule.refreshToken),
				new Couple("token_type_hint", "refresh_token"),
			]),
		)
		.then(() => authModule.resetToken())
		.catch((err) => {
			throw new AuthError(err);
		});
}

export async function generateAccessToken(received: CodeTruple): Promise<void> {
	const authModule = getModule(AuthStore, useStore());
	if (
		received.error ||
		received.state !== authModule.auth.AUTH_STRING ||
		!received.code
	) {
		throw new AuthError(
			`Error: ${received.error ?? "No Error"},  State:${received.state} = ${
				authModule.auth.AUTH_STRING
			},  Code:${received.code}`,
		);
	}
	const tokenBody = `grant_type=authorization_code&code=${received.code}&redirect_uri=${authModule.auth.AUTH_REDIRECT}`;
	const result: Response = await postRedditAPI(
		"/api/v1/access_token",
		tokenBody,
	);
	if (result.ok) {
		const res = (await result.json()) as {
			access_token: string;
			refresh_token: string;
		};

		authModule.setToken(res.access_token);
		authModule.setRefreshToken(res.refresh_token);
	} else {
		throw new NetworkError(result.statusText);
	}
}
