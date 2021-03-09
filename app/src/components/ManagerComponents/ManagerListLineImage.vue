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
import {
	isGallery,
	hasMedia,
	SavedContentType,
} from "@/savedContent/ISavedContent";

export default defineComponent({
	name: "ManagerLineListListImage",
	props: {
		item: {
			required: true,
			type: Object as PropType<SavedContentType>,
		},
		isCollapse: {
			required: true,
			type: Boolean,
		},
	},
	setup(props) {
		const THUMBNAIL_SIZE = "140px";

		function getImage(): string {
			if (hasMedia(props.item)) {
				return props.item.getImageUrl();
			}
			return "https://static.thenounproject.com/png/1134418-200.png";
		}

		function getPreviewImage(): string[] {
			if (isGallery(props.item)) {
				return props.item.gallery.galleryURLs;
			}
			if (hasMedia(props.item)) {
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
