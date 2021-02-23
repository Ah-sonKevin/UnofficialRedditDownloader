import router, { getRouter } from "@/router";
import { StoreTypeTemp, useTypedStore } from "@/store";
import { render, RenderResult } from "@testing-library/vue";
import ElementPlus from "element-plus";
import { MockedObjectDeep } from "ts-jest/dist/utils/testing";
import { mocked } from "ts-jest/utils";
import { Router } from "vue-router";

interface GetWrapperOption {
	store?: StoreTypeTemp;
	useRealStore?: boolean;
	router?: Router;
	useRealRouter?: boolean;
}
export function getWrapper(
	component: unknown,
	options?: GetWrapperOption,
): RenderResult {
	const plugins = [];
	plugins.push(ElementPlus);
	if (options) {
		if (options.store) {
			plugins.push(options.store);
		} else if (options.useRealStore) {
			plugins.push(useTypedStore());
		}
		if (options.router) {
			plugins.push(options.router);
		} else if (options.useRealRouter) {
			plugins.push(getRouter());
		}
	}
	return render(component, {
		global: {
			plugins,
		},
	});
}
// toremember not use getElementById in component
// can't print unprintable html element as any (return nothing, no t even null/blank)
export function getFullWrapper(component: unknown): RenderResult {
	return getWrapper(component, { useRealRouter: true, useRealStore: true });
}

export function getEmptyWrapper(component: unknown): RenderResult {
	return getWrapper(component);
}

export function getMockedWrapper(
	component: unknown,
	// todo tocheck
	/* options: {
		 gettersValue: { 
			auth?: Record<string, unknown>;
			user: Record<string, unknown>;
		}; 
	}, // tocheck to keep ?
	*/
): {
	wrapper: RenderResult;
	mockRouter: MockedObjectDeep<Router>;
	mockStore: MockedObjectDeep<StoreTypeTemp>; // todo change name interface
} {
	jest.mock("router");
	jest.mock("store");

	const mockRouter = mocked(router, true);
	const mockStore = mocked(useTypedStore(), true); // tocheck is working ?

	const wrapper = getWrapper(component, {
		store: mockStore,
		router: mockRouter,
	});
	return { wrapper, mockRouter, mockStore };
}
