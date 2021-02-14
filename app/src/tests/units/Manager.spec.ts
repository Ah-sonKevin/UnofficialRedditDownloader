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
	beforeAll(() => {
		jest.resetAllMocks();
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

	test("Baddly formed url", () => {});

	test("Well formed  but invalid url", () => {});

	test("Well formed  & valid url", () => {});
});
