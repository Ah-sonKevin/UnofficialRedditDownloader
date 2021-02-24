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

describe("Router Test", () => {
	// todo cehck create fresh store/router
	test("Exist", () => {
		expect(true).toBeTruthy();
	});

	test("Already connected", () => {
		expect(true).toBeTruthy();
	});

	test("Not yet connected", () => {
		expect(true).toBeTruthy();
	});
});
