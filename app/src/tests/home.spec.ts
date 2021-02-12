import HomeDownloadLink from "@/components/HomeDownloadLink.vue";
import { mount } from "@vue/test-utils";
import ElementPlus from "element-plus";

const mockRouter = {
	push: jest.fn(),
};
const mixin = {
	onBeforeMount() {
		console.log("Component was created!");
	},
};

describe("Home.vue", () => {
	const wrapper = mount(HomeDownloadLink, {
		global: {
			plugins: [ElementPlus],
			mocks: { $router: mockRouter },
			mixins: [mixin],
		},
	});

	test("Exist", () => {
		expect(wrapper.exists()).toBeTruthy();
	});
	//todo one or many test
	//todo test components or sub components
});
