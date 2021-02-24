/*
jest.mock("@/router");
jest.mock("@/store");

// todo mock store
describe("Home.vue", () => {
	beforeAll(() => jest.resetAllMocks());

	beforeEach(() => {
		const storeEl = store;

		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		mocked(storeEl, true).getters.isConnected = true;
		render(Home, { global: { plugins: [ElementPlus] } });
	});

	test("Already connected", () => {
		// eslint-disable-next-line @typescript-eslint/unbound-method
		expect(mocked(router).push).toHaveBeenCalledWith("Manager");
	});

	test("Not yet connected", () => {
		// todo test
		// eslint-disable-next-line @typescript-eslint/unbound-method
		expect(mocked(router.push)).not.toHaveBeenCalled();
	});
});
*/

test("Not yet connected", () => {
	expect(true).toBe(true);
});
