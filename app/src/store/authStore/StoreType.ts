import { CommitOptions, Store as VuexStore } from "vuex";

export type StoreType<
	S,
	MT extends { [key: string]: (...args: any[]) => any },
	GT extends { [key: string]: (...args: any[]) => any }
> = Omit<VuexStore<S>, "getters" | "commit"> & {
	commit<K extends keyof MT, P extends Parameters<MT[K]>[1]>(
		key: K,
		payload: P,
		options?: CommitOptions,
	): ReturnType<MT[K]>;
} & {
	getters: {
		[K in keyof GT]: ReturnType<GT[K]>;
	};
};
