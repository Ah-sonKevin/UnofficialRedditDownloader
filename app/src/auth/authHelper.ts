import { AuthError, NetworkError } from "@/errors/restartError";
import { useTypedStore } from "@/store";
import { postOapi, postRedditAPI } from "../helper/fetchHelper/fetchHelper";
import { Couple } from "../helper/fetchHelper/requestArgument";
import { MutationsNames } from "../store/authStore/authStoreMutationTypes";

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
	const store = useTypedStore();
	postOapi("/api/v1/revoke_token", [
		new Couple("token", store.getters.token),
		new Couple("token_type_hint", "access_token"),
	])
		.then(() =>
			postOapi("/api/v1/revoke_token", [
				new Couple("token", store.getters.refreshToken),
				new Couple("token_type_hint", "refresh_token"),
			]),
		)
		.then(() => store.commit(MutationsNames.RESET_TOKEN, undefined))
		.catch((err) => {
			throw new AuthError(err);
		});
}

export async function generateAccessToken(received: CodeTruple): Promise<void> {
	const store = useTypedStore();
	if (
		received.error ||
		received.state !== store.getters.auth.AUTH_STRING ||
		!received.code
	) {
		throw new AuthError(
			`Error: ${received.error ?? "No Error"},  State:${received.state} = ${
				store.getters.auth.AUTH_STRING
			},  Code:${received.code}`,
		);
	}
	const tokenBody = `grant_type=authorization_code&code=${received.code}&redirect_uri=${store.getters.auth.AUTH_REDIRECT}`;
	const result: Response = await postRedditAPI(
		"/api/v1/access_token",
		tokenBody,
	);
	if (result.ok) {
		const res = (await result.json()) as {
			access_token: string;
			refresh_token: string;
		};

		store.commit(MutationsNames.SET_TOKEN, res.access_token);
		store.commit(MutationsNames.SET_REFRESH_TOKEN, res.refresh_token);
	} else {
		throw new NetworkError(result.statusText);
	}
}
