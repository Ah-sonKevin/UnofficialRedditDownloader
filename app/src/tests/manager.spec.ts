import Manager from "@/views/Manager.vue";
import { mount } from "@vue/test-utils";
import ElementPlus from "element-plus";

const mockRouter = {
	push: jest.fn(),
};

describe("Manager.vue", () => {
	const wrapper = mount(Manager, {
		global: { plugins: [ElementPlus], mocks: { $router: mockRouter } },
	});

	test("Exist", () => {
		expect(wrapper.exists()).toBeTruthy();
	});
});
