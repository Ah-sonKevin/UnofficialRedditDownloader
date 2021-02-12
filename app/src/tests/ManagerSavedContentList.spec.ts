/* eslint-disable promise/no-callback-in-promise */
/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable jest/no-done-callback */
import ManagerSavedContentList from "@managerComponents/ManagerSavedContentList.vue";
import { mount } from "@vue/test-utils";
import ElementPlus from "element-plus";

const mockRouter = {
	push: jest.fn(),
};

const useRouter = () =>
	console.log("********************* use router *****************");
process.on("UnhandledPromiseRejectionWarning", (e) => {
	throw e;
});
const mixin = {
	beforeMount() {
		console.log("Manager was beforeMount!");
	},
};

describe("Manager.vue", () => {
	test("Exist", () => {
		console.log("aaaaaaaaaaaaaaaaaaaaaa");
		const wrapper = mount(ManagerSavedContentList, {
			global: {
				plugins: [ElementPlus],
				mocks: { $router: mockRouter, useRouter },
				mixins: [mixin],
			},
		});
		expect(wrapper.exists()).toBeTruthy();
	});
});
