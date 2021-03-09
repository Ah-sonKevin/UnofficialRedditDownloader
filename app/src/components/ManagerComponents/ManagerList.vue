<template>
	<ul v-if="items.length > 0">
		<li v-for="item in items" :key="item.id">
			<ManagerListLine :item="item" :is-gold="isGold" />
		</li>
	</ul>
	<el-empty v-else description="You don't have any saved content"></el-empty>
</template>

<script lang="ts">
import ManagerListLine from "@managerComponents/ManagerListLine.vue";
import { defineComponent, PropType } from "vue";
import { SavedContentType } from "@/savedContent/ISavedContent";

export default defineComponent({
	name: "ManagerList",
	components: {
		ManagerListLine,
	},
	props: {
		items: {
			required: true,
			type: Array as PropType<SavedContentType[]>,
		},
		isGold: {
			required: true,
			type: Boolean,
		},
	},
});
</script>

<style lang="scss" scoped></style>
