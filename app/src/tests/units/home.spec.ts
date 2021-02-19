import Home from "@/views/Home.vue";
import { getWrapper } from "../wrapperFactory";

describe("Home.vue", () => {
	beforeAll(() => jest.resetAllMocks());

	test("Exist", () => {
		const wrapper = getWrapper(Home, {
			useRealStore: true,
			useRealRouter: true,
		});
		expect(wrapper.exists()).toBeTruthy();
	});

	test("Already connected", () => {});

	test("Not yet connected", () => {});
});
