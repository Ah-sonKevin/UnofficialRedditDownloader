import Home from "@/views/Home.vue";
import { mount } from "@vue/test-utils";
import ElementPlus from "element-plus";

describe("Home.vue", () => {
	const wrapper = mount(Home, { global: { plugins: [ElementPlus] } });

	test("Exist", () => {
		expect(wrapper.exists()).toBeTruthy();
	});
});
