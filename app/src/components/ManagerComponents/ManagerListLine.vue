<template>
	<el-container
		:id="item.id"
		class="savedElement"
		:class="{ deleted: item.isDeleted, collapsed: isCollapsed }"
	>
		<el-aside width="auto" class="checkboxArea">
			<input v-model="isChecked" type="checkbox" class="checkbox" />
		</el-aside>
		<transition name="leftImage">
			<el-aside
				v-if="!isCollapsed && !item.isDeleted"
				class="imageArea thumbnail"
			>
				<ManagerListLineImage :item="item"></ManagerListLineImage>
			</el-aside>
		</transition>
		<el-container class="mainContainer">
			<el-main>
				<h2 class="titleArea">{{ item.title }}</h2>
				<div class="tags">
					<el-tag type="info" size="mini">{{ "Type: " + item.type }}</el-tag>
					<el-tag type="info" size="mini">{{ "/r/" + item.subreddit }}</el-tag>
				</div>

				<div v-if="!item.isDeleted" class="infoLine">
					{{ item.category }}
					<div v-if="isGold" class="selectCategory">
						<el-select v-model="itemCategory" popper-append-to-body="false">
							<el-option
								v-for="i in item"
								:key="i.title"
								:value="i.title"
							></el-option>
						</el-select>
						<el-button>Add category</el-button>
					</div>
					<template v-if="item.isText">
						<div class="textArea">
							{{ item.text }}
						</div>
					</template>
					<template v-else-if="isCollapsed && !item.isDeleted">
						<template v-if="item.isVideo && item.embeddedUrl">
							<video class="videoArea" style="margin: auto" controls>
								<source :src="item.embeddedUrl" />
							</video>
						</template>
						<ManagerListLineImage
							v-else
							class="imageArea"
							:item="item"
						></ManagerListLineImage>
					</template>
				</div>
				<i v-else>This post has been deleted</i>
			</el-main>
			<el-footer height="auto" class="buttonGroup">
				<template v-if="!item.isDeleted">
					<el-button @click="unsave">Unsave</el-button>
					<el-button v-if="item.isLink" @click="openLink">
						Open link
					</el-button>
					<el-button v-else @click="download"> Download </el-button>
					<el-button @click="changeCollapse">
						{{ collapseMessage }}
					</el-button>
					<el-button @click="seeOnReddit"> See on Reddit </el-button>
				</template>
				<template v-else>
					<el-button type="text" @click="save">Undo</el-button>
				</template>
			</el-footer>
		</el-container>
	</el-container>
	<el-Divider></el-Divider>
</template>
<script lang="ts">
import {
	defineComponent,
	useContext,
	computed,
	PropType,
	ref,
	nextTick,
} from "vue";
import SavedContent from "@/savedContent/savedContent";
import ManagerListLineImage from "./ManagerListLineImage.vue";

export default defineComponent({
	name: "ManagerLineList",
	components: { ManagerListLineImage },
	props: {
		item: {
			required: true,
			type: Object as PropType<SavedContent>,
		},
		isGold: {
			required: true,
			type: Boolean,
		},
	},
	emits: ["unsave", "save", "download", "select", "setItemCategory"],
	setup(props) {
		const context = useContext();
		const isChecked = computed({
			get: () => props.item.isSelected,
			set: (value: boolean) => {
				context.emit("select", { item: props.item, value });
			},
		});

		const itemCategory = computed({
			get: () => props.item.category,
			set: (val) =>
				context.emit("setItemCategory", { item: props.item, category: val }),
		});
		const isCollapsed = ref(false);

		const collapseMessage = computed(() => {
			if (!isCollapsed.value) {
				return "See Less";
			}
			return "See More";
		});

		function unsave(): void {
			context.emit("unsave", props.item);
			isCollapsed.value = false;
		}

		function save(): void {
			context.emit("save", props.item);
		}

		async function changeCollapse() {
			isCollapsed.value = !isCollapsed.value;
			await nextTick();
			const el = document.getElementById(props.item.id);
			if (el) {
				const MARGIN = 20;
				const info = el.getBoundingClientRect();
				window.scrollTo({
					left: 0,
					top: window.scrollY + info.top - MARGIN,
					behavior: "smooth",
				});
			}
		}

		function seeOnReddit(): void {
			window.open(props.item.redditUrl);
		}

		function download(): void {
			context.emit("download", props.item);
		}

		function openLink() {
			window.open(props.item.externalUrl);
		}

		return {
			isChecked,
			isCollapsed,
			unsave,
			save,
			changeCollapse,
			seeOnReddit,
			download,
			openLink,

			collapseMessage,
			itemCategory,
		};
	},
});
</script>
<style lang="scss" scoped>
.savedElement * {
	max-height: 100%;
}
.el-main,
.maincontainer {
	height: 100%;
}

.el-tag {
	float: right;
}
ul {
	list-style-type: none;
}
ul li {
	list-style-type: none;
}

.checkboxArea {
	border: 1px solid grey;
}

.checkboxArea {
	width: auto;
}

.checkbox {
	margin: auto 1em auto 1em;
}

.checkbox .el-checkbox {
	margin: none;
}
.imageArea.thumbnail,
.videoArea.thumbnail {
	border: 1px solid white;
	height: 15vw;
	width: 15vw;
}
.el-image {
	margin: auto;
}

.el-aside {
	width: auto;
	display: flex;
}

.buttonGroup {
	display: flex;
}

.buttonGroup .el-button {
	margin: auto;
	color: white;
}
.el-divider {
	margin: 8px 0;
}

.savedElement {
	border: 1px solid grey;
	background-color: #1a1a1b;
	color: white;
}

.collapse {
	height: 100px;
	width: 100%;
	background-color: white;
}

.imageArea.leftImage-enter-active,
.imageArea.leftImage-leave-active {
	transition: all 0.25s;
}

.imageArea.leftImage-enter-from,
.imageArea.leftImage-leave-to {
	transition-delay: 0s;
	width: 0 !important;
}

.imageArea.leftImage-enter-to,
.imageArea.leftImage-leave-from {
	transition-delay: 0.5s;
	width: auto;
}

.collapse_ {
	transform-origin: 0 0;
	height: auto;
}

.collapsed .imageArea {
	margin: auto;
	height: 100%;
}

.imageArea {
	margin: 0;
	height: 100%;
}
.deleted {
	opacity: 0.25;
	//   font-size: 0.5em;
	transition: all 1s;
}

.infoLine {
	max-height: 90000px;
}

.deleted .infoLine {
	max-height: 0;
	display: none;
	transition: all 1s;
	transition-delay: 0.5s;
}

.imageArea.deleted,
.videoArea.deleted {
	width: 0;
	transition: all 0.5s;
}

.textArea {
	max-height: 99999em;
}
.collapsed .textArea,
.collapsed .titleArea {
	max-height: 99999em;
}
.textArea,
.titlerArea {
	transition: max-height 1s ease-in-out;
	transition-delay: 0.5s;
}
.textArea,
.titleArea {
	overflow: hidden;
	/* for set '...' in absolute position */
	position: relative;
	line-height: 1.2em;
	max-height: 2.4em;
	/* fix problem when last visible word doesn't adjoin right side  */
	text-align: justify;
	/* place for '...' */
	margin-right: 1em;
	padding-right: 1em;
}
.textArea:before,
.titleArea:before {
	content: "...";
	position: absolute;
	/* set position to right bottom corner of block */
	right: 0;
	bottom: 0;
}
/* hide ... if we have text, which is less than or equal to max lines */
.textArea:after,
.titleArea:after {
	content: "";
	position: absolute;
	right: 0;
	/* set width and height */
	width: 1em;
	height: 1em;
	margin-top: 0.2em;
	background: #1a1a1b;
}
.tags {
	display: flex;
	justify-content: space-between;
}
</style>
