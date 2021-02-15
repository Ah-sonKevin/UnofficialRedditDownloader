<template>
	<el-image
		:preview-src-list="getPreviewImage()"
		lazy
		:src="getImage()"
		fit="cover"
		:width="THUMBNAIL_SIZE"
		:height="THUMBNAIL_SIZE"
	>
		<template #error>
			<i class="el-icon-picture-outline" />
		</template>
	</el-image>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import SavedContent from "@/savedContent/savedContent";

export default defineComponent({
	name: "ManagerLineListListImage",
	props: {
		item: {
			required: true,
			type: Object as PropType<SavedContent>,
		},
		isCollapse: {
			required: true,
			type: Boolean,
		},
	},
	setup(props) {
		const THUMBNAIL_SIZE = "140px";

		function getImage(): string {
			if (props.item.hasImage) {
				return props.item.imageLink;
			}
			return "https://static.thenounproject.com/png/1134418-200.png";
		}

		function getPreviewImage(): string[] {
			if (props.item.isGallery) {
				return props.item.galleryURLs;
			}
			if (props.item.hasImage) {
				return [getImage()];
			}
			return [];
		}

		return {
			getImage,
			THUMBNAIL_SIZE,
			getPreviewImage,
		};
	},
});
</script>

<style scoped>
.el-image {
	width: 100%;
	height: 100%;
}
</style>
