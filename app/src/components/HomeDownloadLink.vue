<template>
	<form id="input">
		<el-input
			v-model="urlInput"
			placeholder="Enter item's URL"
			required
			pattern="(((http(s)?:\/\/)?www\.)?reddit\.com\/r\/(\w|\/)+)"
			@input="checkValidity"
		>
			<template #append>
				<el-button type="primary" @click="downloadItem"> Download </el-button>
			</template>
		</el-input>
		<label :class="{ active: !isValid }">Please enter a valid reddit URL</label>
		<input type="submit" />
	</form>
</template>

<script lang="ts">
import { defineComponent, ref, onBeforeMount } from "vue";
import { BadLinkError, DownloadError } from "@/errors/restartError";
import { RawItem } from "@/savedContent/rawItemInterface";
import { buildContent } from "@/savedContent/contentBuilder";
import { download } from "@/helper/Download/objectDownloader";

export default defineComponent({
	name: "HomeDownloadLink",

	setup() {
		const urlInput = ref("");
		const isValid = ref(true);
		let inputElement: HTMLFormElement;

		onBeforeMount(() => {
			inputElement = document.getElementById("input") as HTMLFormElement;
		});

		function checkValidity() {
			if (inputElement) {
				isValid.value = inputElement.reportValidity();
			}
		}

		function downloadItem() {
			checkValidity();
			if (isValid.value) {
				fetch(`${urlInput.value}.json`)
					.then(el => {
						if (el.ok) {
							return el.json();
						}
						throw new BadLinkError("Couldn't access link");
					})
					.then((json: RawItem[]) => {
						const content = json[0].data.children[0];
						return buildContent({ kind: content.kind, data: content.data });
					})
					.then(item => download(item))
					.catch(() => {
						throw new DownloadError();
					});
			}
		}

		return {
			checkValidity,
			downloadItem,
			urlInput,
			isValid,
		};
	},
});
</script>

<style lang="scss" scoped></style>
