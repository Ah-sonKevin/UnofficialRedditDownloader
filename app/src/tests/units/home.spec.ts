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
	// todo mock router & store
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
});
// toremember need to await router.isReady ou flushPromise after router.push because rooting is asynchrone
