/**
 * @jest-environment jsdom
 */
import { OAUTH_API } from "@/helper/fetchHelper/fetchHelper";
import { StoreTypeTemp } from "@/store";
import Manager from "@/views/Manager.vue";
import { mount } from "@vue/test-utils";
import ElementPlus from "element-plus";
import nock from "nock";
import { MutationsNames } from "../../store/authStore/authStoreMutationTypes";
import { makeCustomTypedStore } from "../../store/index";
import items from "./mockFetchData/items.json";
import user from "./mockFetchData/user.json";
// todo
const LOADING_TIMEOUT = 1000;
const getWrapper = (store: StoreTypeTemp) =>
	mount(Manager, {
		global: {
			plugins: [ElementPlus, store],
		},
	});

// todo nock doc Memory issues with Jest
describe("Home.vue", () => {
	let store: StoreTypeTemp;

	beforeEach(async () => {
		jest.resetAllMocks();
		store = makeCustomTypedStore({});
		store.commit(MutationsNames.CREATE_AUTH_DATA, undefined);
		store.commit(MutationsNames.SET_TOKEN, "Token");
		store.commit(MutationsNames.SET_REFRESH_TOKEN, "Refresh Token");
	});

	beforeAll(() => {
		nock(OAUTH_API)
			.get("/api/v1/me")
			.reply(200, user)
			.get(/\/user\/\w+\/saved.+$/)
			.reply(200, items)
			.persist();
	});

	test("Input text", async () => {
		expect(true).toBeTruthy();
	});
});
