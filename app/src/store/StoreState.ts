import { AuthStoreState } from "./authStore/state";
import { UserStoreState } from "./userStore/states";

export interface StoreState {
	user: UserStoreState;
	auth: AuthStoreState;
}
