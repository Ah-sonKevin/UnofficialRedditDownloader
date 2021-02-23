<template>
	<form id="inputForm" ref="formElement">
		<label for="inputText">Enter a post's URL</label>
		<el-input
			id="inputText"
			v-model="urlInput"
			placeholder="http://reddit.com/r/..."
			required
			pattern="^((((http(s)?:\/\/)?www\.)?reddit\.com)?\/r\/(\w|\/)+)$"
		>
			<template #append>
				<el-button id="formButton" type="primary" @click="downloadItem">
					Download
				</el-button>
			</template>
		</el-input>
		<p v-show="!validity.isValid" id="errorMessage" role="alert">
			{{ getErrorMessage }}
		</p>
		<input id="button" type="submit" />
	</form>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, ref, Ref, UnwrapRef } from "vue";

import { BadLinkError } from "@/errors/restartError";
import { RawItem } from "@/savedContent/rawItemInterface";
import { buildContent } from "@/savedContent/contentBuilder";
import { download } from "@/helper/Download/objectDownloader";
import { DownloadError } from "@/errors/notifError";
import { notifyError } from "@/helper/notifierHelper";

export default defineComponent({
	name: "HomeDownloadLink",

	// eslint-disable-next-line max-lines-per-function
	setup() {
		const urlInput = ref(""); // tocheck
		const formElement: Ref<HTMLFormElement | null> = ref(null);

		type ValidityType = "downloadError" | "structureError" | null;
		const validity: {
			isValid: boolean;
			reason: ValidityType;
		} = reactive({
			isValid: true,
			reason: null, // tocheck need type null
		});

		const getErrorMessage = computed(() => {
			switch (validity.reason) {
				case "downloadError":
					return "The Download fail, please check that this url correspond to a reddit post";
				case "structureError":
					return "This url is invalid, please enter a valid url";
				case null:
					return "";
				default:
					throw new Error(); // todo change type error & add error handler
			}
		});

		function setInvalid(type: ValidityType) {
			validity.isValid = false;
			validity.reason = type;
		}

		function setValid() {
			validity.isValid = true;
			validity.reason = null;
		}

		function checkValidity() {
			const form = formElement.value;
			if (form) {
				// needed ?
				if (form.reportValidity()) {
					setValid();
				} else {
					setInvalid("structureError");
				}
			} else {
				setInvalid("structureError");
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

		function isValidRedditPost(posts: RawItem[]): boolean {
			// tocheck type, not sure RawItem, cxan't instanceof
			/*	console.log(posts);
			console.log(
				`TEST validity : ${Array.isArray(posts)} ${posts.length}  ${
					posts[0].data.children[0].kind
				}`,
			); */
			if (Array.isArray(posts) && posts.length > 0) {
				const content = posts[0].data.children[0];
				const kind = content.kind;
				if (kind === "t1" || kind === "t3") {
					return true;
				}
			}
			return false;
		}

		// toremember can't convert async PromiseReject error to 'normal' error
		// eslint-disable-next-line max-statements
		async function downloadItem() {
			checkValidity();
			if (validity.isValid) {
				try {
					const url = getRedditUrl(urlInput.value);
					const el = await fetch(`${url}.json`); // tocheck invalid value
					if (el.ok) {
						const json = (await el.json()) as RawItem[];
						if (isValidRedditPost(json)) {
							const content = json[0].data.children[0];
							const item = await buildContent({
								kind: content.kind,
								data: content.data,
							});
							download(item);
						} else {
							throw new DownloadError(`INVALID POST ${url}`);
						}
					} else {
						throw new BadLinkError(`-- Couldn't access link  ${url}`);
					}
				} catch (err) {
					// why can"t cast error
					if (err instanceof Error) {
						if (err instanceof DownloadError) {
							setInvalid("downloadError");
						} else if (err instanceof BadLinkError) {
							// todo structure error ?
							setInvalid("downloadError");
						}
					}
					throw err;
				}
			}
		}
		// todo animate error
		return {
			checkValidity,
			downloadItem,
			urlInput,
			validity,
			formElement,
			getErrorMessage,
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