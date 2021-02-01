import { createStore } from "vuex";
import createPersistedState from "vuex-persistedstate";
import AuthStore from "./authStore";
import userStore from "./userStore";

const pathsArray = ["auth", "user"];

export const store = createStore({
	state: {},
	actions: {},
	getters: {},
	mutations: {},
	modules: {
		user: userStore,
		auth: AuthStore,
	},
	plugins: [
		createPersistedState({
			paths: pathsArray,
			storage: window.sessionStorage,
		}),
	],

	// strict: true
});

// showError : ({ rawError: true })
