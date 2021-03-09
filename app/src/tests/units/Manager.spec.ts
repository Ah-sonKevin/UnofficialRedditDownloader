/**
 * @jest-environment jsdom
 */
// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable jest-dom/prefer-in-document */
import * as dataManager from "@/helper/dataManager";
import { buildContent } from "@/savedContent/ItemBuilder/contentBuilder";
import { makeCustomTypedStore } from "@/store";
import User from "@/User/User";
import Manager from "@/views/Manager.vue";
import userEvent from "@testing-library/user-event";
import {
	findByRole,
	getAllByRole,
	getByRole,
	getByText,
	queryByRole,
	render,
	screen,
	waitFor
} from "@testing-library/vue";
import ElementPlus from "element-plus";
import { mocked } from "ts-jest/utils";
import comment from "./mockFetchData/soloItem/comment/comment.json";
import gallery from "./mockFetchData/soloItem/gallery/gallery.json";
import image from "./mockFetchData/soloItem/image/image.json";
import link from "./mockFetchData/soloItem/link/link.json";
import text from "./mockFetchData/soloItem/text.json";
import video from "./mockFetchData/soloItem/video/video.json";
import { getLongItem } from "./tmp";
// toremember will not work with resetMock true (will remove mocked implement but not puit jest.fn() , will just be undefined)

jest.mock(
	"@/helper/dataManager",
	() => ({
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
		...(jest.requireActual("@/helper/dataManager") as typeof dataManager),
		fetchUser: () =>
			Promise.resolve(new User({ name: "z", id: "a", is_gold: false })),

		fetchCategories: jest.fn(() => Promise.resolve([])),
		recGetItems: jest.fn(() => {
			throw new Error();
		}),
	}),
	// tocheck needed
);

const mockStore = makeCustomTypedStore({});
const renderManager = () =>
	render(Manager, {
		global: {
			plugins: [ElementPlus, mockStore],
		},
	});

describe("Empty", () => {
	beforeEach(() => {
		mocked(dataManager.recGetItems).mockReset();
		mocked(dataManager.recGetItems).mockImplementationOnce(() =>
			Promise.resolve([]),
		);
		renderManager();
	});

	describe("Initial State", () => {
		test("Total Number of element (number)", () => {
			const el = screen.getByText(/you have .* saved items/i); // tocheck make better getter
			expect(el).toHaveTextContent("0");
		});

		test("Number of element shown", () => {
			const main = screen.getByRole("main");
			const el = queryByRole(main, "list");
			expect(el).toBeNull();
		});

		test("Empty element", () => {
			const main = screen.getByRole("main");
			const list = queryByRole(main, "list");
			expect(list).toBeNull();
			const emptyMain = getByText(main, "You don't have any saved content");
			expect(emptyMain).toBeVisible();
		});
	});
});

describe("Initial State", () => {
	beforeEach(async () => {
		const mockItem = Promise.resolve([
			// tocheck beforeAll ?
			await buildContent(comment),
			await buildContent(gallery),
			await buildContent(image),
			await buildContent(link),
			await buildContent(text),
			await buildContent(video),
		]);
		mocked(dataManager.recGetItems).mockReset();
		mocked(dataManager.recGetItems).mockImplementationOnce(() => mockItem);
		renderManager();
	});

	// tocheck toBeVisible => to exist
	test("Number of element (number)", async () => {
		const main = screen.getByRole("main");
		const list = await findByRole(main, "list");
		const line = getAllByRole(list, "listitem");
		expect(line).toHaveLength(6);
	});

	// todo change nock to mock ?
	test("Empty element", async () => {
		const main = screen.getByRole("main");
		const list = await findByRole(main, "list");
		const emptyMain = screen.queryByText("You don't have any saved content");
		expect(emptyMain).toBeNull();
		expect(list).not.toBeNull();
	});
});

describe("One page", () => {
	beforeEach(async () => {
		const mockItem = Promise.resolve([
			// tocheck beforeAll ?
			await buildContent(comment),
			await buildContent(gallery),
			await buildContent(image),
			await buildContent(link),
			await buildContent(text),
			await buildContent(video),
		]);
		mocked(dataManager.recGetItems).mockReset();
		mocked(dataManager.recGetItems).mockImplementationOnce(() => mockItem);
		renderManager();
	});

	// todo
	test("Total Number of element (number)", async () => {
		// todo change place
		const el = screen.getByText(/you have .* saved items/i);
		await waitFor(() => expect(el).toHaveTextContent("You have 6 saved items")); // tocheck
	});

	test("Number of items shown", async () => {
		const main = screen.getByRole("main");
		const list = await findByRole(main, "list");
		const line = getAllByRole(list, "listitem");
		expect(line).toHaveLength(6);
	});

	test("Number of pages", async () => {
		const info = screen.getByRole("contentinfo");
		const listPage = getAllByRole(info, "listitem");
		expect(listPage).toHaveLength(1);
	});
});

describe("Multiple Pages", () => {
	beforeEach(async () => {
		console.log(getLongItem);
		const mockItem = Promise.resolve([
			// tocheck beforeAll ?
			await buildContent(comment),
			await buildContent(gallery),
			await buildContent(image),
			await buildContent(link),
			await buildContent(text),
			await buildContent(video),
			await buildContent(comment),
			await buildContent(gallery),
			await buildContent(image),
			await buildContent(link),
			await buildContent(text),
			await buildContent(video),
		]);
		mocked(dataManager.recGetItems).mockReset();
		mocked(dataManager.recGetItems).mockImplementationOnce(() => mockItem);
		renderManager(); // toremember : RENDER MUST BE DONE AFTER the mock
	});

	test("Total Number of element (number)", async () => {
		const el = screen.getByText(/you have .* saved items/i);
		await waitFor(() =>
			expect(el).toHaveTextContent("You have 12 saved items"),
		); // tocheck
	});

	test("Number of items shown", async () => {
		const main = screen.getByRole("main");
		const list = await findByRole(main, "list");
		const line = getAllByRole(list, "listitem");
		expect(line).toHaveLength(10);
	});

	test("Number of pages", async () => {
		const el = screen.getByText(/you have .* saved items/i);
		const info = screen.getByRole("contentinfo");
		await waitFor(() =>
			expect(el).toHaveTextContent("You have 12 saved items"),
		);
		const listPage = getAllByRole(info, "listitem");
		console.log(listPage);
		console.log(listPage[0].innerHTML);
		await waitFor(() => expect(listPage).toHaveLength(2));
	});

	test.skip("Change of pages", async () => {
		const button = screen.getByRole("button", { name: "2" });
		userEvent.click(button);
		const el = screen.getAllByAltText("page number");
		expect(el).toHaveTextContent("2");
	});
});

describe.skip("Filed", () => {
	describe("Search", () => {
		test("Empty text", async () => {
			const input = screen.getByRole("input");
			userEvent.type(input, "eazrfsdgdfg");
			const lines = screen.getByRole("list");
			expect(lines).not.toBeInTheDocument();
		});

		test("Result text", async () => {
			const input = screen.getByRole("input");
			userEvent.type(input, "eazrfsdgdfg");
			const lines = screen.getAllByAltText("LINE_ELEMENT");
			expect(lines).toHaveLength(2);
		});
	});

	describe("Elements", () => {
		test("Unsave", async () => {
			const main = screen.getByRole("main");
			const list = getByRole(main, "list");
			const line = getAllByRole(list, "listitem")[0];
			expect(line).toHaveStyle({ opacity: 1 });
			const button = screen.getByRole("button", { name: "unsave" });
			userEvent.click(button);
		});

		test("Undo unsave", async () => {
			const main = screen.getByRole("main");
			const list = getByRole(main, "list");
			const line = getAllByRole(list, "listitem")[0];
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
			const main = screen.getByRole("main");
			const list = getByRole(main, "list");
			const line = getAllByRole(list, "listitem")[1];
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
				const lines = screen.getByRole("list");
				expect(lines).toHaveLength(1);
			});

			test("One Multiple", async () => {
				const button = screen.getByRole("button", { name: "FILTER" });
				userEvent.click(button);
				const lines = screen.getByRole("list");
				expect(lines).toHaveLength(2);
			});
		});

		test("Undo filter", async () => {
			const button = screen.getByRole("button", { name: "FILTER" });
			const lines = screen.getByRole("list");
			userEvent.click(button);
			expect(lines).toHaveLength(2);
			userEvent.click(button);
			expect(lines).not.toBeInTheDocument();
		});

		test("Combine filter", async () => {
			const filter1 = screen.getByRole("button", { name: "FILTER" });
			userEvent.click(filter1);
			const lines = screen.getByRole("list");
			expect(lines).toHaveLength(3);
			const filter2 = screen.getByRole("button", { name: "FILTER" });
			userEvent.click(filter2);
			const lines2 = screen.getByRole("list");
			expect(lines2).toHaveLength(1);
		});
	});

	describe("Sorter", () => {
		test("Sorter 1", () => {
			const button = screen.getByRole("button", { name: "sorter" });
			userEvent.click(button);
			const main = screen.getByRole("main");
			const list = getByRole(main, "list");
			const line = getAllByRole(list, "listitem");
			expect(true).toBe(false);
		});
	});
});

// later test error popup
