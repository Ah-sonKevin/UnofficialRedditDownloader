<template>
	<el-dialog v-model="showDialog" title="Items selected">
		<ul>
			<li v-for="item in selectedItem" :key="item.id">
				//tocheck allwo to unselect
				<el-button type="text" @click="unselect(item)">
					{{ item.title }}
				</el-button>
			</li>
		</ul>
	</el-dialog>
</template>

<script lang="ts">
import { PropType, defineComponent, computed } from "vue";
import SavedContent from "@/savedContent/savedContent";

export default defineComponent({
	name: "ManagerShowSelectedItemsDialog",
	props: {
		showSelectedDialog: {
			required: true,
			type: Boolean,
		},
		selectedItem: {
			required: true,
			type: Array as PropType<SavedContent[]>,
		},
	},
	emits: ["changeShowSelectedDialog", "unselect"],
	setup(props, context) {
		const showDialog = computed({
			get: () => props.showSelectedDialog,
			set: () => context.emit("changeShowSelectedDialog"),
		});

		function unselect(item: SavedContent) {
			context.emit("unselect", item);
		}

		return {
			unselect,
			showDialog,
		};
	},
});
</script>

<style lang="scss" scoped></style>
