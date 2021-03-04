/**
 * @jest-environment jsdom
 */
// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable jest-dom/prefer-in-document */
import { OAUTH_API } from "@/helper/fetchHelper/fetchHelper";
import { StoreTypeTemp } from "@/store";
import Manager from "@/views/Manager.vue";
import userEvent from "@testing-library/user-event";
import { getByRole, render, screen } from "@testing-library/vue";
import ElementPlus from "element-plus";
import nock from "nock/types";
import items from "./mockFetchData/items.json";
import user from "./mockFetchData/user.json";

const SEARCH_INPUT = "";
const LINE_ELEMENT = "";
const SIDE_MENU = "";
const MAIN = "";
const EMPTY_MAIN = "";
const PAGE_NUMBER = "";
const TOTAL_NUMBER_ITEMS = "";
const LOADING_TIMEOUT = 1000;
const renderManager = (store: StoreTypeTemp) =>
	render(Manager, {
		global: {
			plugins: [ElementPlus, store],
		},
	});

describe("Home.vue", () => {
	beforeEach(async () => {
		jest.resetAllMocks();
		nock.restore();
		nock.activate();
	});

	describe("Empty", () => {
		beforeAll(() => {
			nock(OAUTH_API)
				.get("/api/v1/me")
				.reply(200, user)
				.get(/\/user\/\w+\/saved.+$/)
				.reply(200, {})
				.get("/api/saved_categories")
				.reply(200, {})
				.persist();
		});

		beforeEach(() => {
			render(Manager);
		});

		describe("Initial State", () => {
			test("Total Number of element (number)", async () => {
				const el = screen.getByLabelText("nb");
				expect(el).toHaveTextContent("2");
			});

			test("Number of element shown", async () => {
				const el = screen.getByAltText(LINE_ELEMENT);
				expect(el).not.toBeInTheDocument();
			});

			test("Empty element", async () => {
				const main = screen.getByAltText(MAIN);
				expect(main).not.toBeVisible();
				const emptyMain = screen.getAllByAltText(EMPTY_MAIN);
				expect(emptyMain).toBeVisible();
			});
		});
	});

	describe("Initial State", () => {
		beforeAll(() => {
			nock(OAUTH_API)
				.get("/api/v1/me")
				.reply(200, user)
				.get(/\/user\/\w+\/saved.+$/)
				.reply(200, items)
				.get("/api/saved_categories")
				.reply(200, {})
				.persist();
		});

		beforeEach(() => {
			render(Manager);
		});

		test("Number of element (number)", async () => {
			const el = screen.getAllByAltText(LINE_ELEMENT);
			expect(el).toHaveLength(5);
		});

		test("Empty element", async () => {
			const emptyMain = screen.getAllByAltText(EMPTY_MAIN);
			expect(emptyMain).not.toBeVisible();
			const main = screen.getByAltText(MAIN);
			expect(main).toBeVisible();
		});
	});

	describe("One page", () => {
		test("Total Number of element (number)", async () => {
			const el = screen.getAllByAltText(LINE_ELEMENT);
			expect(el).toHaveLength(5);
		});

		test("Number of items shown", async () => {
			const el = screen.getByLabelText("nb");
			expect(el).toHaveTextContent("2");
		});
	});

	test("Number of pages", async () => {
		const el = screen.getByLabelText("nb");
		expect(el).toHaveTextContent("2");
	});

	test("Change of pages", async () => {
		const el = screen.getAllByAltText(PAGE_NUMBER);
		expect(el).toHaveTextContent("1");
	});
});

describe("Multiple Pages", () => {
	test("Total Number of element (number)", async () => {
		const el = screen.getAllByAltText(TOTAL_NUMBER_ITEMS);
		expect(el).toHaveLength(5);
	});

	test("Number of items shown", async () => {
		const el = screen.getAllByAltText(LINE_ELEMENT);
		expect(el).toHaveTextContent("2");
	});

	test("Number of pages", async () => {
		const el = screen.getAllByAltText(PAGE_NUMBER);
		expect(el).toHaveTextContent("2");
	});

	test("Change of pages", async () => {
		const button = screen.getByRole("button", { name: "2" });
		userEvent.click(button);
		const el = screen.getAllByAltText(PAGE_NUMBER);
		expect(el).toHaveTextContent("2");
	});
});

describe("Filed", () => {
	describe("Search", () => {
		test("Empty text", async () => {
			const input = screen.getByRole("input");
			userEvent.type(input, "eazrfsdgdfg");
			const lines = screen.getByAltText(LINE_ELEMENT);
			expect(lines).not.toBeInTheDocument();
		});

		test("Result text", async () => {
			const input = screen.getByRole("input");
			userEvent.type(input, "eazrfsdgdfg");
			const lines = screen.getAllByAltText(LINE_ELEMENT);
			expect(lines).toHaveLength(2);
		});
	});

	describe("Elements", () => {
		test("Unsave", async () => {
			// later test content collapse
			const line = screen.getAllByAltText(LINE_ELEMENT)[0];
			expect(line).toHaveStyle({ opacity: 1 });
			const button = screen.getByRole("button", { name: "unsave" });
			userEvent.click(button);
		});

		test("Undo unsave", async () => {
			const line = screen.getAllByAltText(LINE_ELEMENT)[0];
			expect(line).toHaveStyle({ opacity: 1 });
			const button = screen.getByRole("button", { name: "unsave" });
			userEvent.click(button);
			expect(button).not.toBeVisible();
			expect(line.style.opacity).toBeLessThan(1);
			const button2 = screen.getByRole("button", { name: "undo" });
			expect(button2).toBeVisible();
		});

		test("Collapse", async () => {
			const button = screen.getByRole("button", { name: "See More" });
			userEvent.click(button);
			const button2 = screen.getByRole("button", { name: "See Less" });
			expect(button2).toBeVisible();
			expect(button).not.toBeVisible();
			expect(screen.getAllByRole("todo")).toBeVisible();
		});

		test("Un-collapse", async () => {
			const button = screen.getByRole("button", { name: "See More" });
			userEvent.click(button);
			const button2 = screen.getByRole("button", { name: "See Less" });
			expect(button2).toBeVisible();
			expect(button).not.toBeVisible();
			expect(screen.getAllByRole("todo")).toBeVisible();
			userEvent.click(button2);
			expect(button).toBeVisible();
			expect(button2).not.toBeVisible();
			expect(screen.getAllByRole("todo")).not.toBeVisible();
		});
	});

	describe("Selection", () => {
		test("Select", async () => {
			const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
			userEvent.click(checkbox);
			expect(checkbox.checked).toBe(true);
		});

		test("Unselect", async () => {
			const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
			userEvent.click(checkbox);
			expect(checkbox.checked).toBe(true);
			userEvent.click(checkbox);
			expect(checkbox.checked).toBe(false);
		});

		test("Select All", async () => {
			const button = screen.getByRole("button", { name: "selectAll" });
			userEvent.click(button);
			const list = screen.getAllByRole("checkbox") as HTMLInputElement[];
			list.forEach((el) => expect(el.checked).toBe(true));
		});

		test("Unselect All", async () => {
			const button = screen.getByRole("button", { name: "selectAll" });
			userEvent.click(button);
			const list = screen.getAllByRole("checkbox") as HTMLInputElement[];
			const button2 = screen.getByRole("button", { name: "unselectAll" });
			userEvent.click(button2);
			list.forEach((el) => expect(el.checked).toBe(true));
		});

		test("Unsave selected", async () => {
			const line = screen.getAllByAltText(LINE_ELEMENT)[1];
			const checkbox = getByRole(line, "checkbox");
			userEvent.click(checkbox);
			const button = screen.getByRole("button", { name: "unsave" });
			userEvent.click(button);
			expect(getByRole(line, "button", { name: "undo" })).toBeVisible();
		});

		test("Popup show selected", () => {
			const button = screen.getByRole("button", { name: "showSelected" });
			userEvent.click(button);
			expect(true).toBe(false);
		});
	});

	describe("Filter", () => {
		describe("One filter", () => {
			test("One Result", async () => {
				const button = screen.getByRole("button", { name: "FILTER" });
				userEvent.click(button);
				const lines = screen.getByAltText(LINE_ELEMENT);
				expect(lines).toHaveLength(1);
			});

			test("One Multiple", async () => {
				const button = screen.getByRole("button", { name: "FILTER" });
				userEvent.click(button);
				const lines = screen.getByAltText(LINE_ELEMENT);
				expect(lines).toHaveLength(2);
			});
		});

		test("Undo filter", async () => {
			const button = screen.getByRole("button", { name: "FILTER" });
			const lines = screen.getByAltText(LINE_ELEMENT);
			userEvent.click(button);
			expect(lines).toHaveLength(2);
			userEvent.click(button);
			expect(lines).not.toBeInTheDocument();
		});

		test("Combine filter", async () => {
			const filter1 = screen.getByRole("button", { name: "FILTER" });
			userEvent.click(filter1);
			const lines = screen.getByAltText(LINE_ELEMENT);
			expect(lines).toHaveLength(3);
			const filter2 = screen.getByRole("button", { name: "FILTER" });
			userEvent.click(filter2);
			const lines2 = screen.getByAltText(LINE_ELEMENT);
			expect(lines2).toHaveLength(1);
		});
	});

	describe("Sorter", () => {
		test("Sorter 1", () => {
			const button = screen.getByRole("button", { name: "sorter" });
			userEvent.click(button);
			const line = screen.getAllByAltText(LINE_ELEMENT);
			expect(true).toBe(false);
		});
	});
});

// later test error popup
