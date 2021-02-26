/**
 * @jest-environment jsdom
 */
import { OAUTH_API } from "@/helper/fetchHelper/fetchHelper";
import { StoreTypeTemp } from "@/store";
import Manager from "@/views/Manager.vue";
import { render } from "@testing-library/vue";
import ElementPlus from "element-plus";
import nock from "nock";
import items from "./mockFetchData/items.json";
import user from "./mockFetchData/user.json";
// todo

const LOADING_TIMEOUT = 1000;
const renderManager = (store: StoreTypeTemp) =>
	render(Manager, {
		global: {
			plugins: [ElementPlus, store],
		},
	});

// todo nock doc Memory issues with Jest
describe("Home.vue", () => {
	beforeEach(async () => {
		jest.resetAllMocks();
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
