/**
 * @jest-environment jsdom
 */

import { makeRouter } from "@/router";
import { makeCustomTypedStore } from "@/store";
import { MutationsNames } from "@/store/authStore/authStoreMutationTypes";
import Home from "@/views/Home.vue";
import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/vue";
import { flushPromises } from "@vue/test-utils";
import ElementPlus from "element-plus";

const mockPush = jest.fn();
function renderHome(isConnected: boolean) {
	const mockRouter = makeRouter();
	mockRouter.push = mockPush;

	const mockStore = makeCustomTypedStore({
		getters: {
			isConnected: () => isConnected,
			auth: () => ({
				AUTH_LINK: "VALUE",
			}),
		},
		mutations: {
			[MutationsNames.CREATE_AUTH_DATA](state: unknown) {},
		},
	});

	return render(Home, {
		global: {
			plugins: [ElementPlus, mockStore, mockRouter],
		},
	});
}

describe("Home.vue", () => {
	beforeAll(() => jest.resetAllMocks());

	test("Already connected", async () => {
		renderHome(true);
		userEvent.click(screen.getByRole("button", { name: "connectToReddit" }));
		await flushPromises();
		expect(mockPush).toHaveBeenCalledWith({ name: "Manager" });
		expect(mockPush).toHaveBeenCalledTimes(1);
	});

	describe.skip("Hover", () => {
		test("Hover info", () => {
			const tooltip = screen.getByRole("tooltip");
			const tooltipText = screen.getByRole("text");
			userEvent.hover(tooltip);
			expect(tooltipText).toContain("aaaa");
		});

		test("Hover Appear", () => {
			const tooltipText = screen.getByRole("text");
			expect(tooltipText).not.toContain("aaaa");
		});

		test("Hover Disappear", () => {
			const tooltip = screen.getByRole("tooltip");
			const tooltipText = screen.getByRole("text");
			userEvent.hover(tooltip);
			expect(tooltipText).toContain("aaaa");
			userEvent.unhover(tooltip);
			expect(tooltipText).not.toContain("aaaa");
		});
	});
});
// Need to await router.isReady ou flushPromise after router.push because rooting is asynchronous
