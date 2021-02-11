import router from "@/router";
import { mount } from "@vue/test-utils";
import ElementPlus from "element-plus";

const App = {
	template: `
	  <router-link to="/posts">Go to posts</router-link>
	  <router-view />
	`,
};

describe("Login.vue", () => {
	const wrapper = mount(App, { global: { plugins: [ElementPlus, router] } });

	test("Exist", () => {
		expect(wrapper.exists()).toBeTruthy();
	});
});
