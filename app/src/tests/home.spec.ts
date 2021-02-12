import router from "@/router";
import { store } from "@/store";
import Home from "@/views/Home.vue";
import { mount } from "@vue/test-utils";
import ElementPlus from "element-plus";

const mockRouter = {
	push: jest.fn(),
};

const getWrapper = () =>
	mount(Home, {
		global: {
			plugins: [ElementPlus, store, router],
			mocks: { $router: mockRouter },
		},
	});

describe("Home.vue", () => {
	test("Exist", () => {
		const wrapper = getWrapper();
		expect(wrapper.exists()).toBeTruthy();
	});

	test("Already connected", () => {});

	test("Not yet connected", () => {});
});
