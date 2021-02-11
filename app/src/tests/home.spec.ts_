import router from "@/router";
import Home from "@/views/Home.vue";
import { mount } from "@vue/test-utils";
import ElementPlus from "element-plus";

describe("Home.vue", () => {
	const wrapper = mount(Home, { global: { plugins: [ElementPlus, router] } });

	test("Exist", () => {
		expect(wrapper.exists()).toBeTruthy();
	});
});
