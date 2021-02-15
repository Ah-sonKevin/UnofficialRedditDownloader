import { StoreState } from "@/store";
import { CommitOptions, Module, Store as VuexStore } from "vuex";
import { mutations, MutationsTypes } from "./authStoreMutationTypes";
import { Getters, GettersType } from "./getter";
import { AuthState, AuthStoreState } from "./state";

export const AuthModule: Module<AuthStoreState, StoreState> = {
	state: AuthState,
	mutations,
	getters: Getters,
	actions: {},
};

export type AuthStoreType<S = AuthStoreState> = Omit<
	VuexStore<S>,
	"getters" | "commit"
> & {
	commit<
		K extends keyof MutationsTypes,
		P extends Parameters<MutationsTypes[K]>[1]
	>(
		key: K,
		payload: P,
		options?: CommitOptions,
	): ReturnType<MutationsTypes[K]>;
} & {
	getters: {
		[K in keyof GettersType]: ReturnType<GettersType[K]>;
	};
};
