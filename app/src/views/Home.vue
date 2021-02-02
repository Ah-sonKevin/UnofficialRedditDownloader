<template>
	<div class="home">
		<img alt="Vue logo" src="assets/logo.png" />
		<button @click="connectToReddit">connectToReddit</button>
		<HomeDownloadLink />
	</div>
</template>

<script lang="ts">
import HomeDownloadLink from "@/components/HomeDownloadLink.vue";
import { defineComponent } from "vue";
import { getModule } from "vuex-module-decorators";
import AuthStore from "@/store/authStore";
import { store } from "@/store";

import { useRouter } from "vue-router";
import createAuthData from "@/auth/permission";

export default defineComponent({
	components: { HomeDownloadLink },
	setup() {
		const router = useRouter();
		const authModule = getModule(AuthStore, store);
		function connectToReddit(): void {
			if (!authModule.isConnected) {
				authModule.createAuthData(); 
				window.location.href = authModule.auth.AUTH_LINK;
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
