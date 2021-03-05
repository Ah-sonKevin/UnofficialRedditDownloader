<template>
	<form id="inputForm" ref="formElement">
		<label for="inputText">
			<el-input
				id="inputText"
				v-model="urlInput"
				name="inputText"
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
			Enter a post's URL
		</label>
		<p
			v-show="!validity.isValid"
			id="errorMessage"
			ref="errorMessageField"
			role="alert"
		>
			{{ getErrorMessage }}
		</p>
		<input id="button" type="submit" />
	</form>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, ref, Ref } from "vue";

import { BadLinkError } from "@/errors/restartError";
import { isRawItemArray, RawItem } from "@/savedContent/rawItemInterface";
import { download } from "@/helper/Download/objectDownloader";
import { DownloadError } from "@/errors/notifError";
import { notifyError } from "@/helper/notifierHelper";
import { buildContent } from "@/savedContent/ItemBuilder/contentBuilder";

export default defineComponent({
	name: "HomeDownloadLink",

	// eslint-disable-next-line max-lines-per-function
	setup() {
		const urlInput = ref("");
		const formElement: Ref<HTMLFormElement | null> = ref(null);

		type ValidityType = "downloadError" | "structureError" | null;
		const validity: {
			isValid: boolean;
			reason: ValidityType;
		} = reactive({
			isValid: true,
			reason: null,
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
					// tocheck switch exhaustiveness
					throw new Error(); 
			}
		});

		function setInvalid(type: ValidityType) {
			validity.isValid = false;
			validity.reason = type;
			errorMessageField.value?.classList.add("formShake"); // tocheckonrun
			setTimeout(
				() => errorMessageField.value?.classList.remove("formShake"),
				600,
			);
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

		function isValidRedditPost(posts: RawItem[]): boolean {
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

		async function downloadPost(json: RawItem[]) {
			const content = json[0].data.children[0];
			const item = await buildContent({
				kind: content.kind,
				data: content.data,
			});
			void download(item);
		}

		function downloadError(err: unknown) {
			if (err instanceof Error) {
				if (err instanceof DownloadError) {
					setInvalid("downloadError");
				} else if (err instanceof BadLinkError) {
					setInvalid("downloadError");
				} else {
					throw err;
				}
			} else {
				throw err;
			}
		}
		async function downloadItem() {
			checkValidity();
			if (validity.isValid) {
				try {
					const url = getRedditUrl(urlInput.value);
					const el = await fetch(`${url}.json`); // tocheck invalid value
					if (!el.ok) {
						throw new BadLinkError(`-- Couldn't access link  ${url}`);
					}
					const json: unknown = await el.json();

					if (!isRawItemArray(json) || !isValidRedditPost(json)) {
						throw new DownloadError(`INVALID POST ${url}`);
					}
					await downloadPost(json);
					// tocheck when to throw ? add error handler ? add popup ?
				} catch (err) {
					downloadError(err);
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
// later use vuelidate and async validation
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

.formShake {
	animation: shake 0.2s;
	animation-iteration-count: 3;
}
@keyframes shake {
	0% {
		transform: translateX(0px);
	}
	25% {
		transform: translateX((3px));
	}
	50% {
		transform: translateX((0px));
	}
	75% {
		transform: translateX((-3px));
	}
	100% {
		transform: translateX((0px));
	}
}
</style>
