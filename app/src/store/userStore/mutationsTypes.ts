import User from "@/User/User";
import { MutationTree } from "vuex";
import { UserStoreState } from "./states";

export enum MutationsNames {
	SET_USER = "SET_USER",
}

export type MutationsTypes<S = UserStoreState> = {
	[MutationsNames.SET_USER](state: S, user: User): void;
};

export const mutations: MutationTree<UserStoreState> & MutationsTypes = {
	[MutationsNames.SET_USER](state: UserStoreState, user: User): void {
		state.user = user;
	},
};
