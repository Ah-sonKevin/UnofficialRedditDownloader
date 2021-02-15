<template>
	<header class="header">
		<nav>
			<router-link to="/">Home</router-link> |
			<router-link to="/about">About</router-link>
			<router-link to="/manager">Manager</router-link>
			<el-button v-if="isConnected" type="text" @click="disconnect()">
				Disconnect
			</el-button>
		</nav>
	</header>
</template>

<script lang="ts">
import { defineComponent, computed, ComputedRef } from "vue";
import { useRouter } from "vue-router";
import { useTypedStore } from "@/store";
import { MutationsNames } from "@/store/authStore/authStoreMutationTypes";

export default defineComponent({
	name: "TheNavigation",
	setup() {
		const store = useTypedStore();
		const isConnected: ComputedRef<boolean> = computed(
			() => store.getters.isConnected,
		);
		function disconnect() {
			store.commit(MutationsNames.RESET_TOKEN, undefined);
			void useRouter().push({ name: "Home" });
		}
		return {
			disconnect,
			isConnected,
		};
	},
});
</script>
