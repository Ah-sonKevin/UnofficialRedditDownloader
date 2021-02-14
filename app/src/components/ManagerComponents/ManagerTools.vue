<template>
	<el-button @click="selectAll()"> Select All </el-button>
	<el-button @click="unselectAll()"> Unselect All </el-button>
	<el-button @click="applyToSelected(unsave)"> Unsave </el-button>
	<el-button @click="downloadSelected()"> Download </el-button>
	<el-button @click="getSelectedURLs()"> Get all URLs </el-button>
	<el-button v-if="isGold" @click="applyToSelected(changeCategory)">
		Change Category
	</el-button>

	{{ "Selected items: " + selectedItem.length }}
	<el-button type="text" @click="showSelectedDialog">See selected</el-button>
</template>

<script lang="ts">
import { useContext, defineComponent, PropType } from "vue";
import { ElMessage } from "element-plus";
import SavedContent from "@/savedContent/savedContent";
import { download, downloadObject } from "@/helper/Download/objectDownloader";

export default defineComponent({
	name: "ManagerTools",
	props: {
		selectedItem: {
			required: true,
			type: Array as PropType<SavedContent[]>,
		},
		isGold: {
			required: true,
			type: Boolean,
		},
	},
	emits: ["unsave", "selectAll", "unselectAll", "showSelectedDialog"], // tocheck why
	setup(props) {
		const context = useContext();

		function downloadSelected() {
			if (props.selectedItem.length === 0) {
				ElMessage.error("Selection is empty");
				return;
			}
			download(props.selectedItem);
			unselectAll();
		}

		function showSelectedDialog() {
			context.emit("showSelectedDialog");
		}

		function unsave() {
			context.emit("unsave");
		}
		function applyFunctionToArray(
			array: SavedContent[],
			func: (el: SavedContent) => void,
		): void {
			array.forEach((el) => func(el));
		}

		function applyToSelected(func: (el: SavedContent) => void) {
			if (props.selectedItem.length === 0) {
				ElMessage.error("Selection is empty");
				return;
			}
			applyFunctionToArray(props.selectedItem, func);
			unselectAll();
		}

		function selectAll(): void {
			context.emit("selectAll");
		}

		function unselectAll() {
			context.emit("unselectAll");
		}

		function getSelectedURLs() {
			const urls = props.selectedItem.map((el) => el.redditUrl);
			// downloadObject(new Blob(urls), "redditUrls.txt");
		}

		function changeCategory() {}

		return {
			downloadSelected,
			applyToSelected,
			selectAll,
			context,
			unsave,
			applyFunctionToArray,
			unselectAll,
			showSelectedDialog,
			getSelectedURLs,
			changeCategory,
		};
	},
});
</script>

<style lang="scss" scoped></style>
