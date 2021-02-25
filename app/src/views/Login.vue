<template>
	<div>Login</div>
</template>

<script lang="ts">
import { onBeforeMount, defineComponent } from "vue";
import { useRoute, useRouter } from "vue-router";
import { NetworkError } from "@/errors/restartError";
import { generateAccessToken } from "@/auth/authHelper";

export default defineComponent({
	setup() {
		const { query } = useRoute();
		const router = useRouter();

		onBeforeMount(() => {
			generateAccessToken({
				state: query.state as string,
				code: query.code as string,
				error: query.error as string,
			})
				.then(() => router.push("Manager"))
				.catch((reason: unknown) => {
					if (reason instanceof Error) {
						throw new NetworkError(reason.message);
					}
				});
		});
	},
});
</script>
