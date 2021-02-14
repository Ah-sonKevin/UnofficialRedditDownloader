<template>
	<ul v-if="items">
		<li v-for="item in items" :key="item.id">
			<ManagerLineList :item="item" :is-gold="isGold" />
		</li>
	</ul>
	<el-empty v-else description="You don't have any saved content"></el-empty>
</template>

<script lang="ts">
import ManagerLineList from "@managerComponents/ManagerLineList.vue";
import SavedContent from "@/savedContent/savedContent";
import { defineComponent, PropType } from "vue";

export default defineComponent({
	name: "ManagerSavedContentList",
	components: {
		ManagerLineList,
	},
	props: {
		items: {
			required: true,
			type: Array as PropType<SavedContent[]>,
		},
		isGold: {
			required: true,
			type: Boolean,
		},
	},
});
</script>

<style lang="scss" scoped></style>
