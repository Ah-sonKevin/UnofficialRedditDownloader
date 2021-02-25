/**
 * @jest-environment jsdom
 */
// todo stub ?

import Home from "@/views/Home.vue";
import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/vue";
import ElementPlus from "element-plus";
import { makeRouter } from "../../router/index";
import { MutationsNames } from "../../store/authStore/authStoreMutationTypes";
import { makeCustomTypedStore } from "../../store/index";

// todo be sure same router/store everywhere
const mockPush = jest.fn();
function renderHome(isConnected: boolean) {
	// todo mock
	const mockRouter = makeRouter();

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

	mockRouter.push = mockPush;
	return render(Home, {
		global: {
			plugins: [ElementPlus, mockStore, mockRouter],
		},
	});
}

describe("Home.vue", () => {
	beforeAll(() => jest.resetAllMocks());

	beforeEach(() => {
		/*	// eslint-disable-next-line const-case/uppercase
		const url = "dummy";
		globalThis.location.href = "aa";
		Object.defineProperty(window, "location", {
			value: { href: url },
			writable: true,
		}); */
	});

	test("Already connected", async () => {
		renderHome(true);
		userEvent.click(screen.getByRole("button", { name: "connectToReddit" }));
		expect(mockPush).toHaveBeenCalledWith({ name: "Manager" });
		expect(mockPush).toHaveBeenCalledTimes(1);
	});
});
