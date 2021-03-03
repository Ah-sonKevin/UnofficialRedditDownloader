<template>
	<router-view></router-view>
	<!--router view -->
</template>
<script lang="ts">
import { defineComponent, inject } from "vue";
import { useRouter } from "vue-router";

export default defineComponent({
	name: "NavTest",

	setup() {
		const route: string | undefined = inject("route");
		if (!route) {
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

		const router = useRouter();

		void router.push({ path: route, query }).catch((err: Error) => {
			throw err;
		});
	},
});
</script>
