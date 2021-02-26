import { InjectionKey } from "vue";
import { createStore, Store, StoreOptions } from "vuex";
import createPersistedState from "vuex-persistedstate";
import { AuthModule, AuthStoreType } from "./authStore/authStore";
import { StoreState } from "./StoreState";
import { userModule, UserStoreType } from "./userStore/userStore";

let store: StoreTypeTemp;
export type StoreTypeTemp = AuthStoreType<Pick<StoreState, "auth">> &
	UserStoreType<Pick<StoreState, "user">>;

export const storeKey: InjectionKey<Store<StoreState>> = Symbol("InjectionKey");
const pathsArray = ["auth", "user"];
// todo keep alive manager
export const makeStore = () =>
	createStore<StoreState>({
		// tocheck
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

export function generateTypedStore(): StoreTypeTemp {
	return makeStore() as StoreTypeTemp;
}

export function getTypedStore(): StoreTypeTemp {
	if (store) {
		return store;
	}
	throw new Error("Store is missing"); // tocheck
}

export function makeCustomTypedStore({
	modules,
	plugins,
	mutations,
	state,
	getters,
	actions,
}: StoreOptions<StoreState>): StoreTypeTemp {
	store = createStore<StoreState>({
		modules,
		plugins,
		actions,
		mutations,
		state,
		getters,
	}) as StoreTypeTemp;
	return store;
}
