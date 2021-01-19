import { createStore } from "vuex";
import createPersistedState from "vuex-persistedstate";
import AuthStore from "./authStore";
import ItemStore from "./itemStore";
import userStore from "./userStore";

const pathsArray =
  process.env.NODE_ENV === "production"
    ? ["auth", "user"]
    : ["auth", "item", "user"];
export const store = createStore({
  state: {},
  actions: {},
  getters: {},
  mutations: {},
  modules: {
    user: userStore,
    item: ItemStore,
    auth: AuthStore
  },
  plugins: [
    createPersistedState({
      paths: pathsArray,
      storage: window.sessionStorage
    })
  ]

  // strict: true
});

// showError : ({ rawError: true })
