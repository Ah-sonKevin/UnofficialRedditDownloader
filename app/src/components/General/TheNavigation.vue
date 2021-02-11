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
import { getModule } from "vuex-module-decorators";
import { useStore } from "vuex";
import AuthStore from "@/store/authStore";
import { useRouter } from "vue-router";

export default defineComponent({
	name: "TheNavigation",
	setup() {
		const authModule = getModule(AuthStore, useStore());
		const isConnected: ComputedRef<boolean> = computed(
			() => authModule.isConnected,
		);
		function disconnect() {
			authModule.resetToken();
			void useRouter().push({ name: "Home" });
		}
		return {
			disconnect,
			isConnected,
		};
	},
});
</script>
