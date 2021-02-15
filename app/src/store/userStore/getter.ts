import { DataNotFoundError } from "@/errors/restartError";
import { StoreState } from "@/store";
import User from "@/User/User";
import { GetterTree } from "vuex";
import { UserStoreState } from "./states";

export type GettersType = {
	getUser(state: UserStoreState): User;
	isGold(state: UserStoreState, getters: GettersType): boolean;
};

export const Getters: GetterTree<UserStoreState, StoreState> & GettersType = {
	getUser(state: UserStoreState): User {
		if (!state.user) throw new DataNotFoundError("Undefined User");
		return state.user;
	},
	isGold(state: UserStoreState, getters: GettersType): boolean {
		return getters.getUser(state).isGold;
	},
};
