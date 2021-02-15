import { InjectionKey } from "vue";
import { createStore, Store } from "vuex";
import createPersistedState from "vuex-persistedstate";
import { AuthModule, AuthStoreType } from "./authStore/authStore";
import { AuthStoreState } from "./authStore/state";
import { UserStoreState } from "./userStore/states";
import { userModule, UserStoreType } from "./userStore/userStore";

export interface StoreState {
	user: UserStoreState;
	auth: AuthStoreState;
}

export type StoreTypeTemp = AuthStoreType<Pick<StoreState, "auth">> &
	UserStoreType<Pick<StoreState, "user">>;

// eslint-disable-next-line symbol-description
export const storeKey: InjectionKey<Store<StoreState>> = Symbol();
const pathsArray = ["auth", "user"];
// todo keep alive manager
export const store = createStore<StoreState>({
	// tocheck remove export
	modules: {
		user: userModule,
		auth: AuthModule,
	},
	plugins: [
		createPersistedState({
			paths: pathsArray,
			storage: window.sessionStorage,
		}),
	],

	strict: process.env.NODE_ENV !== "production",
});

export function useTypedStore(): StoreTypeTemp {
	return store as StoreTypeTemp;
}
