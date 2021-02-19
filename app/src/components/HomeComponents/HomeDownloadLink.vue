<template>
	ezdfgdfh
	<form id="inputForm" ref="formElement">
		<label for="inputText">bla</label>
		<el-input
			id="inputText"
			v-model="urlInput"
			placeholder="Enter item's URL"
			required
			pattern="^((((http(s)?:\/\/)?www\.)?reddit\.com)?\/r\/(\w|\/)+)$"
		>
			<template #append>
				<el-button id="formButton" type="primary" @click="downloadItem">
					Download
				</el-button>
			</template>
		</el-input>
		<p v-show="!isValid" id="errorMessage">Please enter a valid reddit URL</p>
		<input id="button" type="submit" />
	</form>
</template>

<script lang="ts">
// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable max-lines-per-function */
import {
	defineComponent,
	ref,
	onBeforeMount,
	computed,
	onMounted,
	Ref,
} from "vue";

import { BadLinkError } from "@/errors/restartError";
import { RawItem } from "@/savedContent/rawItemInterface";
import { buildContent } from "@/savedContent/contentBuilder";
import { download } from "@/helper/Download/objectDownloader";
import { DownloadError } from "@/errors/notifError";

export default defineComponent({
	name: "HomeDownloadLink",

	setup() {
		const urlInput = ref(""); // tocheck
		const isValid = ref(true);
		const formElement: Ref<HTMLFormElement | null> = ref(null);

		function checkValidity() {
			const form = formElement.value;
			if (form) {
				isValid.value = form.reportValidity();
			}
		}

		function getRedditUrl(url: string) {
			//	(((http(s)?:\/\/)?www\.)reddit\.com\)/r\/(\w|\/)+)$

			if (/^http(s)?:\/\/www\.reddit\.com\/r\/(\w|\/)+$/.exec(url)) {
				return url;
			}
			if (/^www\.reddit\.com\/r\/(\w|\/)+$/.exec(url)) {
				return `http://${url}`;
			}
			if (/^reddit\.com\/r\/(\w|\/)+$/.exec(url)) {
				return `http://www.${url}`;
			}
			if (/^\/r\/(\w|\/)+$/.exec(url)) {
				return `http://www.reddit.com${url}`;
			}
			throw new BadLinkError("Couldn't access link");
		}
		// eslint-disable-next-line max-statements
		async function downloadItem() {
			checkValidity();
			console.log("Download");
			console.log(isValid.value);
			if (isValid.value) {
				// const url = getRedditUrl(urlInput.value);
				// eslint-disable-next-line const-case/uppercase
				const url =
					"https://www.reddit.com/r/deals/comments/lmm76b/mcdonalds_is_offering_a_free_sandwich_with_any/";
				try {
					const el = await fetch(`${url}.json`); // tocheck invalid value
					console.log(`THEN 1${el.ok}`);
					if (el.ok) {
						const json = (await el.json()) as RawItem[];
						const content = json[0].data.children[0];
						const item = await buildContent({
							kind: content.kind,
							data: content.data,
						});
						console.log("THEN 3");
						await download(item);
						console.log("DONE");
					} else {
						isValid.value = true;
						throw new BadLinkError("Couldn't access link");
					}
				} catch (err) {
					console.log(err);
					throw new DownloadError(err);
				}
			}
		}

		return {
			checkValidity,
			downloadItem,
			urlInput,
			isValid,
			formElement,
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

#errorMessage {
	color: red;
}
</style>
