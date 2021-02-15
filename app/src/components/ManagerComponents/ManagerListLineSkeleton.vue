<template>
	<el-container class="container savedElement">
		<el-aside width="auto" style="display: flex" class="checkboxArea">
			<el-skeleton-item
				class="checkbox"
				variant="rect"
				style="
					height: 1em;
					width: 1em;
					margin: auto 1em auto 1em;
					display: flex;
				"
			/><!-- Checkbox -->
		</el-aside>
		<el-skeleton-item
			class="imageArea thumbnail"
			variant="image"
			style="height: 200px; width: 20%"
		/><!-- image -->

		<el-container class="mainContainer">
			<el-main>
				<el-skeleton-item
					class="titleArea"
					variant="h2"
					style="height: 1.5em; width: 80%"
				/>
				<div class="tags">
					<el-skeleton-item variant="p" style="height: 1em; width: 25%" />
					<el-skeleton-item variant="p" style="height: 1em; width: 25%" />
				</div>
				<!-- Subreddit & Type -->
				<el-skeleton-item variant="p" style="height: 1em; width: 80%" />
				<el-skeleton-item
					v-for="x in 3"
					:key="x"
					class="textArea infoLine"
					variant="p"
					style="height: 1em; width: 80%"
				/><!-- Text -->
			</el-main>
			<el-footer height="auto" style="display: flex" class="buttonGroup">
				<el-skeleton-item
					v-for="x in 3"
					:key="x"
					class="button"
					variant="p"
				></el-skeleton-item>
				<!-- Button -->
			</el-footer>
		</el-container>
	</el-container>
	<el-Divider></el-Divider>
</template>

<script lang="ts">
export default {
	name: "ManagerSkeletonLine",
};
</script>
<style lang="scss" scoped>
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

.imageArea {
	border: 1px solid white;
	height: 250px;
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

.buttonGroup .button {
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

.postImage {
	margin: 0;
	height: 100%;
}

.textArea {
	overflow-wrap: break-word;
}
.container {
	border: 1px solid white;
}
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
