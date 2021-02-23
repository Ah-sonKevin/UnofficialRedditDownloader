import { CommitOptions, Module, Store as VuexStore } from "vuex";
import { StoreState } from "../StoreState";
import { Getters, GettersType } from "./getter";
import { mutations, MutationsTypes } from "./mutationsTypes";
import { UserState, UserStoreState } from "./states";

export const userModule: Module<UserStoreState, StoreState> = {
	state: UserState,
	mutations,
	getters: Getters,
	actions: {},
};

export type UserStoreType<S = UserStoreState> = Omit<
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
