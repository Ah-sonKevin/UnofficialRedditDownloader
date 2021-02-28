import { Module } from "vuex";
import { StoreState } from "../StoreState";
import { mutations, MutationsTypes } from "./authStoreMutationTypes";
import { Getters, GettersType } from "./getter";
import { AuthState, AuthStoreState } from "./state";
import { StoreType } from "./StoreType";

export const AuthModule: Module<AuthStoreState, StoreState> = {
	state: AuthState,
	mutations,
	getters: Getters,
	actions: {},
};

export type AuthStoreType<S = AuthStoreState> = StoreType<
	S,
	MutationsTypes,
	GettersType
>;
