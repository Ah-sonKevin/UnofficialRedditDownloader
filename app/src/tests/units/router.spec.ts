/**
 * @jest-environment jsdom
 */
import TheNavigation from "@/components/General/TheNavigation.vue";
import router from "@/router";
import { useTypedStore } from "@/store";
import { mount } from "@vue/test-utils";
import ElementPlus from "element-plus";

// tocheck who really need store ?

const store = useTypedStore();

const getWrapper = () =>
	mount(TheNavigation, {
		global: {
			plugins: [ElementPlus, store, router],
		},
	});

describe("Home.vue", () => {
	test("Exist", () => {
		const wrapper = getWrapper();
		// expect(wrapper.exists()).toBeTruthy();
	});

	test("Already connected", () => {});

	test("Not yet connected", () => {});
});
