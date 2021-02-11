import Manager from "@/views/Manager.vue";
import { mount } from "@vue/test-utils";
import ElementPlus from "element-plus";

describe("Manager.vue", () => {
	const wrapper = mount(Manager, { global: { plugins: [ElementPlus] } });

	test("Exist", () => {
		expect(wrapper.exists()).toBeTruthy();
	});
});
