/**
 * @jest-environment jsdom
 */

import router from "@/router";
import AuthStore from "@/store/authStore";
import userStore from "@/store/userStore";
import Home from "@/views/Home.vue";
import { mount } from "@vue/test-utils";
import ElementPlus from "element-plus";
import { createStore } from "vuex";

const mockRouter = {
	push: jest.fn(),
};

jest.mock("vue-router", () => ({
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
	...(jest.requireActual("vue-router") as Record<string, unknown>),
	useRouter: () => mockRouter,
}));

const store = createStore({
	// todo refresh each time
	modules: {
		user: userStore,
		auth: AuthStore,
	},
	strict: true,
});

const getWrapper = () =>
	mount(Home, {
		global: {
			plugins: [ElementPlus, store, router],
			mocks: { $router: mockRouter },
		},
	});

describe("Home.vue", () => {
	beforeAll(() => jest.resetAllMocks());

	test("Exist", () => {
		const wrapper = getWrapper();
		expect(wrapper.exists()).toBeTruthy();
	});

	test("Already connected", () => {});

	test("Not yet connected", () => {});
});
