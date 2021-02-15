<template>
	<div class="home">
		<img alt="Vue logo" src="assets/logo.png" />
		<el-tooltip placement="top">
			<template #content>
				We will only access the information we need, the authentification is
				securised by reedit, we will not have access to your credential
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
import HomeDownloadLink from "@/components/HomeDownloadLink.vue";
import { defineComponent } from "vue";
import { useRouter } from "vue-router";
import { MutationsNames } from "@/store/authStore/authStoreMutationTypes";
import { useTypedStore } from "@/store";

export default defineComponent({
	name: "Home",
	components: { HomeDownloadLink },
	setup() {
		const router = useRouter();
		const store = useTypedStore();
		function connectToReddit(): void {
			if (!store.getters.isConnected) {
				store.commit(MutationsNames.CREATE_AUTH_DATA, undefined);
				window.location.href = store.getters.auth.AUTH_LINK;
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
<style scoped>
input:valid {
	border: solid 1px black;
}
input:invalid {
	border: solid 1px red;
}

label {
	color: red;
	visibility: hidden;
}
label.active {
	display: inline;
	visibility: visible;
}
</style>
