import router, { getRouter } from "@/router";
import { StoreTypeTemp, useTypedStore } from "@/store";
import { mount, VueWrapper } from "@vue/test-utils";
import ElementPlus from "element-plus";
import { mocked } from "ts-jest/utils";
import { Router } from "vue-router";

interface GetWrapperOption {
	store?: StoreTypeTemp;
	useRealStore?: boolean;
	router?: Router;
	useRealRouter?: boolean;
}
export function getWrapper(
	component: any,
	options?: GetWrapperOption,
): VueWrapper<any> {
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
	return mount(component, {
		global: {
			plugins,
		},
	});
}
// toremember not use getElementById in component
// can't print unpinrtable html element as any (return nothing, no t even null/blanlk)
export function getFullWrapper(component: any) {
	return getWrapper(component, { useRealRouter: true, useRealStore: true });
}

export function getEmptyWrapper(component: any) {
	return getWrapper(component);
}

export function getMockedWrapper(
	component: any,
	options: {
		gettersValue: {
			auth?: Record<string, unknown>;
			user: Record<string, unknown>;
		};
	}, // tocheck tokeep ?
): any {
	jest.mock("router");
	jest.mock("store");

	const mockStores = {
		commit: jest.fn(),
		dispatch: jest.fn(),
		getters: {
			...options.gettersValue,
		},
	};

	const mockRouter = mocked(router, true);
	const mockStore = mocked(useTypedStore(), true); // tocheck is working ?

	const wrapper = getWrapper(component, {
		store: mockStore,
		router: mockRouter,
	});
	return { wrapper, mockRouter, mockStore };
}
