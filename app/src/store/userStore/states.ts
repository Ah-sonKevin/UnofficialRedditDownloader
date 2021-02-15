import User from "@/User/User";

export interface UserStoreState {
	user?: User;
}

export const UserState: UserStoreState = {
	user: undefined,
};
