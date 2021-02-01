<template>
	<h1>Page not found</h1>
</template>
<script lang="ts">
import { onBeforeMount } from "vue";
import { useRouter } from "vue-router";

export default {
	setup(): void {
		onBeforeMount(() => {
			void useRouter().push({ name: "Home" });
		});
	},
};
</script>
