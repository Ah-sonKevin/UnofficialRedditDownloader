import Login from "@/views/Login.vue";
import { mount } from "@vue/test-utils";
import ElementPlus from "element-plus";

describe("Login.vue", () => {
	const wrapper = mount(Login, { global: { plugins: [ElementPlus] } });

	test("Exist", () => {
		expect(wrapper.exists()).toBeTruthy();
	});
});
