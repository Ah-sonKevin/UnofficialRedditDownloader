<template>
	<router-view></router-view>
	<!--router view -->
</template>
<script lang="ts">
import { defineComponent, inject } from "vue";
import { useRouter } from "vue-router";
import Home from "@/views/Home.vue";
import Manager from "@/views/Manager.vue";
import About from "@/views/About.vue";

export default defineComponent({
	name: "NavTest",

	setup() {
		const routeTmp: string | undefined = inject("route");
		let route: string;
		if (routeTmp) {
			route = routeTmp; // tocheck
		} else {
			throw new Error("Test is missing route");
		}

		const queryInject: string | undefined = inject("query");
		let query: { code?: string; error?: string; state?: string } | undefined;
		if (queryInject) {
			query = JSON.parse(queryInject) as {
				code?: string;
				error?: string;
				state?: string;
			};
		}
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment

		const router = useRouter();

		void router.push({ path: route, query }).catch((err: Error) => {
			throw err;
		});
	},
});
</script>
