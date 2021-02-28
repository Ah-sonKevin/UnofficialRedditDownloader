import { Module } from "vuex";
import { StoreType } from "../authStore/StoreType";
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

export type UserStoreType<S = UserStoreState> = StoreType<
	S,
	MutationsTypes,
	GettersType
>;
