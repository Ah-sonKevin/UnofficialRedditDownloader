/**
 * @jest-environment jsdom
 */
import Manager from "@/views/Manager.vue";
import { mount } from "@vue/test-utils";
import waitUntil from "async-wait-until";
import ElementPlus from "element-plus";
import nock from "nock";
import { OAUTH_API } from "../../helper/fetchHelper/fetchHelper";
import items from "./mockFetchData/items.json";
import user from "./mockFetchData/user.json";

const getWrapper = () =>
	mount(Manager, {
		global: {
			plugins: [ElementPlus],
		},
	});

// todo nock doc Memory issues with Jest
describe("Home.vue", () => {
	let store: StoreTypeTemp;

	beforeEach(async () => {
		jest.resetAllMocks();
		store = useTypedStore();
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

	test("Input text", () => {
		const wrapper = getWrapper();
		return waitUntil(
			() => !wrapper.vm.loading, // tocheck
			10000,
		).then(() => expect(wrapper.exists()).toBeTruthy());
	});
});
