<template>
	<el-header height="auto">
		<el-switch
			v-model="showDeletedComp"
			active-text="ShowDeleted"
			inactive-text="Hide Deleted"
		/>
		<label>Item per pages: </label>
		<el-select
			v-model="itemPerPageComp"
			popper-append-to-body
			class="itemPerPages"
		>
			<el-option
				v-for="i in activesElementListNumberElement"
				:key="i"
				:value="i"
			/>
		</el-select>
		<label>Order: </label>
		<el-select v-model="selectedSorterComp" popper-append-to-body>
			<el-option v-for="i in sorterList" :key="i" :value="i" />
		</el-select>
	</el-header>
</template>

<script lang="ts">
import { defineComponent, useContext, computed, onBeforeMount } from "vue";
import { itemPerPageList } from "@/enum/itemPerPageList";
import { sorter } from "@/enum/sorter";

export default defineComponent({
	name: "ManagerHeader",
	props: {
		showDeleted: {
			required: true,
			type: Boolean,
		},
		itemPerPage: {
			required: true,
			type: Number,
		},

		selectedSorter: {
			required: true,
			type: String,
		},
	},
	emits: ["changeShowDelete", "changeItemPerPage", "changeSelectedSorter"],

	setup(props) {
		const sorterList: string[] = [];
		const activesElementListNumberElement: number[] = [];
		const context = useContext();
		const showDeletedComp = computed({
			get: () => props.showDeleted,
			set: val => context.emit("changeShowDelete", val),
		});

		const itemPerPageComp = computed({
			get: () => props.itemPerPage,
			set: val => context.emit("changeItemPerPage", val),
		});

		const selectedSorterComp = computed({
			get: () => props.selectedSorter,
			set: val => context.emit("changeSelectedSorter", val),
		});

		// toremember const getValueByKey = (key: string) => (obj: Record<string, any>) =>

		onBeforeMount(() => {
			Object.values(sorter).forEach(el => sorterList.push(el));
			Object.values(itemPerPageList).forEach(el =>
				activesElementListNumberElement.push(el),
			);
		});

		return {
			showDeletedComp,
			itemPerPageComp,
			selectedSorterComp,
			activesElementListNumberElement,
			sorterList,
		};
	},
});
</script>

<style lang="scss" scoped></style>
