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
		jest.resetAllMocks(); // todo mock getItem
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

	describe("number of items", () => {
		test("Number of items shown", async () => {});
	});

	test("Number of element (number)", async () => {});

	test("Empty element", async () => {});
});

describe("Pages", () => {
	test("Number of pages", async () => {});

	test("Change of pages", async () => {});
});

describe("Elements", () => {
	test("Unsave", async () => {});

	test("Undo unsave", async () => {});

	test("Collapse", async () => {});

	test("Uncollapse", async () => {});
});

describe("Selection", () => {
	test("Select", async () => {});

	test("Unselect", async () => {});

	test("Select All", async () => {});

	test("Unselect All", async () => {});

	test("Unsave selected", async () => {});

	test("Popup show selected");
});

describe("Filter", () => {
	// todo test for each
	test("One filter", async () => {});

	test("Undo filter", async () => {});

	test("Combine filter", async () => {});

	test("Unselect All", async () => {});

	test("Unsave selected", async () => {});
});

describe("Sorter", () => {
	// todo test for each
	test("One filter", async () => {});

	test("Undo filter", async () => {});

	test("Combine filter", async () => {});

	test("Unselect All", async () => {});

	test("Unsave selected", async () => {});
});

// todo test error popup
