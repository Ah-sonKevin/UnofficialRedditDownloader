<template>
	Due to Reddit's restrictions you can't access more than 1000 saved posts.
	<el-container class="pageContainer">
		<el-aside>
			<ManagerSideMenu
				class="TheSideMenu"
				:type-filter="typeFilter"
				:category-filter="categoryFilter"
				:subreddit-filter="subredditFilter"
				:subreddit-list="subredditList"
				@changeFilter="setFilter"
			/>
		</el-aside>
		<el-container class="mainArea">
			<el-header id="topArea">
				<div id="toolsArea">
					<ManagerHeader
						:show-deleted="showDeleted"
						:item-per-page="itemPerPage"
						:selected-sorter="selectedSorter"
						:is-gold="isGold"
						@changeShowDelete="changeShowDelete"
						@changeItemPerPage="changeItemPerPage"
						@changeSelectedSorter="changeSelectedSorter"
					/>
					<ManagerTools
						:is-gold="isGold"
						:selected-item="selectedItem"
						@unsave="unsave($event)"
						@selectAll="selectAll"
						@unselectAll="unselectAll"
						@downloadSelected="downloadSelected"
						@showSelectedDialog="showSelectedDialog"
					/>
					<ManagerSearch
						:filtered-items="partiallyFilteredItems"
						:search-input="searchInput"
						@updateInput="updateInput"
					/>
				</div>
				<div id="cancelArea">
					<el-button type="primary" @click="cancelDownload">
						Cancel Download
					</el-button>
				</div>
			</el-header>

			<el-main class="listElement">
				<el-skeleton :loading="loading" animated :count="5" :throttle="500">
					<template #template>
						<ManagerSkeletonLine />
					</template>
					<template #default>
						<ul v-if="getActive().length > 0">
							<li v-for="item in getActive()" :key="item.id">
								<ManagerLineList
									:item="item"
									:is-gold="isGold"
									@unsave="unsave($event)"
									@save="save($event)"
									@download="download(item)"
									@select="select(item, $event)"
									@setItemCategory="setItemCategory(item, $event)"
								/>
							</li>
						</ul>
						<el-empty
							v-else
							description="You don't have any saved content"
						></el-empty>
					</template>
				</el-skeleton>
			</el-main>
			<el-footer>
				<el-pagination
					:total="filteredItems.length"
					:current-page="1"
					:page-size="itemPerPage"
					layout="prev, pager, next, ->, total"
					background
					@current-change="changePage"
				/>
				<el-backtop>Up</el-backtop>
			</el-footer>
		</el-container>
	</el-container>
	<ManagerShowSelectedItemsDialog
		:show-selected-dialog="showSelectedDialog"
		:selected-item="selectedItem"
		@changeShowSelectedDialog="changeShowSelectedDialog"
		@unselect="select($event, false)"
	></ManagerShowSelectedItemsDialog>
</template>
<script lang="ts">
import ManagerShowSelectedItemsDialog from "@managerComponents/ManagerShowSelectedItemsDialog.vue";
import ManagerSearch from "@managerComponents/ManagerSearch.vue";
import ManagerSideMenu from "@managerComponents/ManagerSideMenu.vue";
import ManagerHeader from "@managerComponents/ManagerHeader.vue";
import ManagerTools from "@managerComponents/ManagerTools.vue";
import ManagerSkeletonLine from "@managerComponents/ManagerSkeletonLine.vue";
import ManagerLineList from "@managerComponents/ManagerLineList.vue";

import { defineComponent, ref, Ref, onBeforeMount } from "vue";
import { sorter } from "@/enum/sorter";
import { ElLoading, ElMessage } from "element-plus";
import { itemPerPageList } from "@/enum/itemPerPageList";
import {
	recGetItems,
	fetchUser,
	fetchCategories,
	setSubredditList,
	save,
	unsave,
} from "@/helper/dataManager";
import { UnauthorizedAccess } from "@/errors/restartError";
import SavedContent from "@/savedContent/savedContent";
import {
	filterItems,
	searchByText,
	hideDeleted,
	setFilter,
} from "@/helper/filterHelper";
import { download, cancelDownload } from "@/helper/Download/objectDownloader";
import { getSortedContent } from "../helper/sorter";

export default defineComponent({
	components: {
		ManagerTools,
		ManagerLineList,
		ManagerSkeletonLine,
		ManagerHeader,
		ManagerSideMenu,
		ManagerSearch,
		ManagerShowSelectedItemsDialog,
	},
	setup() {
		const selectedSorter = ref(sorter.ADDED_DATE);
		const itemPerPage = ref(itemPerPageList.SMALL);
		const page = ref(1);
		const searchInput = ref("");
		const showDeleted = ref(true);
		const loading = ref(true);
		const isGold = ref(false);

		const typeFilter: Ref<string[]> = ref([]);
		const categoryFilter: Ref<string[]> = ref([]);
		const subredditFilter: Ref<string[]> = ref([]);

		const showSelectedDialog = ref(false);

		function changePage(_page: number) {
			page.value = _page;
		}

		function changeShowDelete(val: boolean) {
			showDeleted.value = val;
		}
		function changeItemPerPage(val: number) {
			itemPerPage.value = val;
		}
		function changeSelectedSorter(val: string) {
			selectedSorter.value = val;
		}
		function updateInput(val: string) {
			searchInput.value = val;
		}
		function setItemCategory(item: SavedContent, val: string) {
			item.category = val;
		}

		function changeShowSelectedDialog() {
			showSelectedDialog.value = !showSelectedDialog.value;
		}

		let selectedItem: SavedContent[] = [];
		const partiallyFilteredItems: Ref<SavedContent[]> = ref([]);
		const filteredItems: Ref<SavedContent[]> = ref([]);

		const items: Ref<SavedContent[]> = ref([]);

		const subredditList: Ref<string[]> = ref([]);

		const categoriesList: Ref<string[]> = ref([]);

		function unselectAll() {
			selectedItem.forEach(el => {
				el.isSelected = false;
			});
			selectedItem = [];
		}

		function selectAll() {
			filteredItems.value.forEach(el => {
				el.isSelected = true;
				selectedItem.push(el);
			});
		}

		function downloadSelected() {
			if (selectedItem.length === 0) {
				ElMessage.error("Selection is empty");
				return;
			}
			download(selectedItem);

			unselectAll();
		}

		onBeforeMount(() => {
			const loadingSpinner = ElLoading.service({
				fullscreen: true,
				text: "Loading Reddit Data",
			});
			fetchUser()
				.then(user => {
					isGold.value = user.isGold;
					return user;
				})
				.then(user => {
					return recGetItems(user.name);
				})
				.then(fetchedItems => {
					items.value = fetchedItems;
					subredditList.value = setSubredditList(fetchedItems);
					loading.value = false;
					return items;
				})
				.then(() => {
					if (isGold.value === true) {
						return fetchCategories();
					}
					return [];
				})
				.then(categories => {
					categoriesList.value = categories;
					return categoriesList;
				})
				.catch(() => {
					// throw new NetworkError(`Fail when getting data ${String(reason)}`);
					throw new UnauthorizedAccess();
				})
				.finally(() => {
					loadingSpinner.close();
				});
		});

		/* function changeCategory(): void {
      //later change category
      console.log("changeCategory");
      postOapi("/api/saved_categories", []);
    } */
		// toremember need to install npm i autoprefixer other 'dead' not recognisez in browserslist
		function select(content: SavedContent, value: boolean) {
			content.isSelected = value;
			if (value) {
				selectedItem.push(content);
			} else {
				const index = selectedItem.indexOf(content);
				selectedItem.splice(index, 1);
			}
		}

		// later accessibilité

		function getPageElement(itemsList: SavedContent[]) {
			const res = itemsList.slice(
				(page.value - 1) * itemPerPage.value,
				page.value * itemPerPage.value,
			);
			return res;
		}

		function getActive() {
			const filtered = filterItems(
				items.value,
				typeFilter.value,
				categoryFilter.value,
				subredditFilter.value,
			);
			partiallyFilteredItems.value = filtered;
			const filterInput = searchByText(filtered, searchInput.value);
			const notHidden = hideDeleted(filterInput, showDeleted.value);
			filteredItems.value = notHidden;
			const res = getPageElement(
				getSortedContent(notHidden, selectedSorter.value),
			);
			return res;
		}

		return {
			itemPerPage,
			changeItemPerPage,
			changePage,

			showDeleted,
			changeShowDelete,

			changeSelectedSorter,
			selectedSorter,

			searchByText,

			unselectAll,
			selectedItem,
			isGold,

			unsave,
			save,
			download,
			downloadSelected,
			select,

			filteredItems,

			getActive,

			loading,
			setItemCategory,

			typeFilter,
			categoryFilter,
			subredditFilter,

			setFilter,
			subredditList,
			selectAll,
			searchInput,
			updateInput,
			partiallyFilteredItems,

			showSelectedDialog,
			changeShowSelectedDialog,
			cancelDownload,
		};
	},
});
</script>
<style scoped>
.el-header {
	background-color: #030303;
	border: 1px solid grey;
}
.el-aside {
	background-color: #1a1a1b;
	border: 1px solid grey;
}

.pageFooter {
	background-color: #030303;
	border: 1px solid black;
}

.pageContainer {
	color: white;
}

.itemPerPages {
	width: 5em;
}
</style>
