import TheNavigation from "@/components/General/TheNavigation.vue";
import { store } from "@/store";
import { mount } from "@vue/test-utils";
import ElementPlus from "element-plus";

// tocheck who really need store ?
const mockRouter = {
	push: jest.fn(),
};

const getWrapper = () =>
	mount(TheNavigation, {
		global: {
			plugins: [ElementPlus, store],
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
