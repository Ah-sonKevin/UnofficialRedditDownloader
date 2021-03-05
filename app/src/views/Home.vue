<template>
	<div class="home">
		<img alt="Vue logo" src="assets/logo.png" />
		<el-tooltip placement="top">
			<template #content>
				We will only access the information we need, the authentication is
				secured by reedit, we will not have access to your credential
				<router-link v-slot="{ href, navigate }" to="/about#security">
					<a :href="href" @click="navigate"> Read more </a>
				</router-link>
			</template>
			<i class="el el-info-circle">Is this safe</i>
		</el-tooltip>
		<button @click="connectToReddit">connectToReddit</button>
		<HomeDownloadLink />
	</div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import HomeDownloadLink from "@homeComponents/HomeDownloadLink.vue";
import { useRouter } from "vue-router";
import { MutationsNames } from "@/store/authStore/authStoreMutationTypes";
import { StoreTypeTemp } from "@/store";
import { useStore } from "vuex";

export default defineComponent({
	name: "Home",
	components: { HomeDownloadLink },
	setup() {
		const router = useRouter();
		const store = useStore() as StoreTypeTemp;
		function connectToReddit(): void {
			if (!store.getters.isConnected) {
				store.commit(MutationsNames.CREATE_AUTH_DATA, undefined);
				globalThis.location.assign(store.getters.auth.AUTH_LINK);
			} else {
				void router.push({ name: "Manager" });
			}
		}

		return {
			connectToReddit,
		};
	},
});
</script>
<style scoped></style>
