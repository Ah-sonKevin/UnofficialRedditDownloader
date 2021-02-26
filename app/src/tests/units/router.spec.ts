/**
 * @jest-environment jsdom
 */

import User from "@/User/User";
import { render, waitFor } from "@testing-library/vue";
import ElementPlus from "element-plus";
import { Router } from "vue-router";
import { CodeTruple } from "../../auth/authHelper";
import { makeRouter } from "../../router/index";
import {
	generateTypedStore,
	makeCustomTypedStore,
	StoreTypeTemp,
} from "../../store/index";
import NavTest from "./mockFetchData/NavTest.vue";

jest.mock("@/auth/authHelper", () => ({
	generateAccessToken: (query: CodeTruple) => Promise.resolve("TEST"),
}));

jest.mock("@/helper/dataManager", () => ({
	//	fetchUser: () => Promise.reject(new Error("TEST")),
	fetchUser: () =>
		Promise.resolve(new User({ name: "", id: "", is_gold: false })),
	recGetItems: () => Promise.resolve([]),
	fetchCategories: () => Promise.resolve([]),
	setSubredditList: () => [],
}));

let router: Router;
// tocheck who really need store ?

function renderComponent(
	store: StoreTypeTemp,
	{
		routerRender,
		route,
		query,
	}: {
		routerRender: Router;
		route: string;
		query?: unknown;
	},
) {
	let queryTmp; // tocheck
	if (query) {
		queryTmp = query;
	} else {
		queryTmp = {};
	}
	return render(NavTest, {
		global: {
			plugins: [ElementPlus, routerRender, store],
			provide: {
				route,
				query: JSON.stringify(queryTmp),
			},
		},
	});
}


describe("Router Test", () => {
	beforeEach(() => {
		router = makeRouter();
	});

	// todo cehck create fresh store/router  | initial state

	describe("Connection", () => {
		test("Is Connected", async () => {
			const mockStore = makeCustomTypedStore({
				getters: {
					isConnected: () => true,
				},
			});
			renderComponent(mockStore, { route: "Manager", routerRender: router });

			await waitFor(() =>
				expect(router.currentRoute.value.name?.toString()).toBe("Manager"),
			);
		});

		test("Is not connected", async () => {
			const mockStore = makeCustomTypedStore({
				getters: {
					isConnected: () => false,
				},
			});
			renderComponent(mockStore, { route: "Manager", routerRender: router });

			await waitFor(() =>
				expect(router.currentRoute.value.name?.toString()).toBe("Home"),
			);
		});
	});

	describe("Other", () => {
		describe("Query Code", () => {
			test("Has code", async () => {
				router.removeRoute("Manager");
				/* only want to test guard on Login with code, not the redirect from Login to Manager 
				(Already tested in the 'Connection' tests) */

				renderComponent(generateTypedStore(), {
					route: "Login",
					routerRender: router,
					query: {
						code: "code",
						state: "state",
					},
				});

				await waitFor(() =>
					expect(router.currentRoute.value.name?.toString()).toBe("Login"),
				);
			});

			test("Has  error code", async () => {
				renderComponent(generateTypedStore(), {
					route: "Login",
					routerRender: router,
					query: {
						code: "code",
						state: "state",
						error: "error",
					},
				});
				await waitFor(() =>
					expect(router.currentRoute.value.name?.toString()).toBe("Home"),
				);
			});

			test("Don't Have Code", async () => {
				renderComponent(generateTypedStore(), {
					route: "Login",
					routerRender: router,
				});

				await waitFor(() =>
					expect(router.currentRoute.value.name?.toString()).toBe("Home"),
				);
			});
		});

		test("Not found", async () => {
			renderComponent(generateTypedStore(), {
				route: "sdfgfdsgdfg",
				routerRender: router,
			});

			await waitFor(() =>
				expect(router.currentRoute.value.name?.toString()).toBe("Home"),
			);
		});
	});
});
