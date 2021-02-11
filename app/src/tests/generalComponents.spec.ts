import TheFooter from "@/components/General/TheFooter.vue";
import { mount } from "@vue/test-utils";
import ElementPlus from "element-plus";

describe("Home.vue", () => {
	const wrapper = mount(TheFooter, { global: { plugins: [ElementPlus] } });

	test("Exist", () => {
		expect(wrapper.exists()).toBeTruthy();
	});
});
