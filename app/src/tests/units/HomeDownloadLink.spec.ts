/**
 * @jest-environment jsdom
 */
import HomeDownloadLink from "@/components/HomeDownloadLink.vue";
import { mount } from "@vue/test-utils";
import ElementPlus from "element-plus";

// todo updates reddit data
const mockRouter = {
	push: jest.fn(),
};

const getWrapper = () =>
	mount(HomeDownloadLink, {
		global: {
			plugins: [ElementPlus],
		},
	});

describe("Home.vue", () => {
	test("Input text", () => {
		//	const wrapper = getWrapper();
	});

	test("Badly formed url", () => {});

	test("Well formed  but invalid url", () => {});

	test("Well formed  & valid url", () => {});
});
