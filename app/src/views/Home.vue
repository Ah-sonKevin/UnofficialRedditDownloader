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
import permission from "@/helper/permission";
import router from "@/router";

"use strict";

console.log("LoadHome");
export default defineComponent({
	components: { HomeDownloadLink },
	setup() {
		const authModule = getModule(AuthStore, store);
		function connectToReddit(): void {
			if (!authModule.isConnected) {
				authModule.setAuth(permission.createAuthData());
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
// tocheck
/*
  // partie de code facultative pour l'approximation des multiples
  for (var aMultiples = ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"], nMultiple = 0, nApprox = nBytes / 1024; nApprox > 1; nApprox /= 1024, nMultiple++) {
    sOutput = nApprox.toFixed(3) + " " + aMultiples[nMultiple] + " (" + nBytes + " bytes)";
    */
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
