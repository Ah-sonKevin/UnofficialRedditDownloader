<template>
	<el-container class="pageContainer">
		<el-aside>
			//tocheckonrun use aside balise ?
			<ManagerSideMenu
				class="TheSideMenu"
				:is-gold="isGold"
				:type-filter="typeFilter"
				:category-filter="categoryFilter"
				:subreddit-filter="subredditFilter"
				:subreddit-list="subredditList"
				:categories-list="categoriesList"
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
						:number-items="numberItems"
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
						@showSelectedDialog="showSelectedDialog"
					/>
					<ManagerSearch
						:filtered-items="sideFilteredItem"
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
						<ManagerListLineSkeleton />
					</template>
					<template #default>
						//tocheck 3 last events //tocheck download
						<ManagerList
							:items="getActive()"
							:is-gold="isGold"
							@select="select($event)"
							@setItemCategory="setItemCategory($event)"
							@unsave="unsave($event)"
							@save="save($event)"
							@download="download($event)"
						>
						</ManagerList>
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
	//todo check these function argument object
	<ManagerShowSelectedItemsDialog
		:show-selected-dialog="showSelectedDialog"
		:selected-item="selectedItem"
		@changeShowSelectedDialog="changeShowSelectedDialog"
		@unselect="select({ item: $event, value: false })"
	></ManagerShowSelectedItemsDialog>
</template>
<script lang="ts">
import ManagerShowSelectedItemsDialog from "@managerComponents/ManagerShowSelectedItemsDialog.vue";
import ManagerSearch from "@managerComponents/ManagerSearch.vue";
import ManagerSideMenu from "@managerComponents/ManagerSideMenu.vue";
import ManagerHeader from "@managerComponents/ManagerHeader.vue";
import ManagerTools from "@managerComponents/ManagerTools.vue";
import ManagerListLineSkeleton from "@managerComponents/ManagerListLineSkeleton.vue";

import ManagerList from "@managerComponents/ManagerList.vue";

import {
	defineComponent,
	ref,
	Ref,
	onBeforeMount,
	computed,
	ComputedRef,
} from "vue";
import { sorter } from "@/enum/sorter";
import { ElLoading } from "element-plus";
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
import { postOapi } from "@/helper/fetchHelper/fetchHelper";
import { getSortedContent } from "../helper/sorter";

export default defineComponent({
	name: "Manager",
	components: {
		ManagerTools,
		ManagerListLineSkeleton,
		ManagerHeader,
		ManagerSideMenu,
		ManagerSearch,
		ManagerShowSelectedItemsDialog,
		ManagerList,
	},
	// eslint-disable-next-line max-lines-per-function
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
		// nextRelease save on pocket
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
		function setItemCategory({
			item,
			category,
		}: {
			item: SavedContent;
			category: string;
		}) {
			item.category = category;
		}

		function changeShowSelectedDialog() {
			showSelectedDialog.value = !showSelectedDialog.value;
		}

		let selectedItem: SavedContent[] = [];
		const sideFilteredItem: Ref<SavedContent[]> = ref([]);
		const filteredItems: Ref<SavedContent[]> = ref([]);

		const items: Ref<SavedContent[]> = ref([]);
		const numberItems: ComputedRef<number> = computed(() => items.value.length);

		const subredditList: Ref<string[]> = ref([]);

		const categoriesList: Ref<string[]> = ref([]);

		function unselectAll() {
			selectedItem.forEach((el) => {
				el.isSelected = false;
			});
			selectedItem = [];
		}

		function getPageElement(itemsList: SavedContent[]) {
			const res = itemsList.slice(
				(page.value - 1) * itemPerPage.value,
				page.value * itemPerPage.value,
			);
			return res;
		}

		function selectAll() {
			filteredItems.value.forEach((el) => {
				el.isSelected = true;
				selectedItem.push(el);
			});
		}

		function getActive() {
			const filtered = filterItems(items.value, {
				typeFilter: typeFilter.value,
				categoryFilter: categoryFilter.value,
				subredditFilter: subredditFilter.value,
			});
			sideFilteredItem.value = filtered;
			const filterInput = searchByText(filtered, searchInput.value);
			const notHidden = hideDeleted(filterInput, showDeleted.value);
			filteredItems.value = notHidden;
			const res = getPageElement(
				getSortedContent(notHidden, selectedSorter.value),
			);
			return res;
		}

		onBeforeMount(() => {
			const loadingSpinner = ElLoading.service({
				fullscreen: true,
				text: "Loading Reddit Data",
			});
			fetchUser()
				.then((user) => {
					isGold.value = user.isGold;
					return user;
				})
				.then((user) => recGetItems(user.name))
				.then((fetchedItems) => {
					items.value = fetchedItems;
					subredditList.value = setSubredditList(fetchedItems);
					return items;
				})
				.then(() => {
					if (isGold.value === true) {
						return fetchCategories();
					}
					return [];
				})
				.then((categories) => {
					categoriesList.value = categories;
					return categoriesList;
				})
				.catch((err) => {
					// todo error screen / redirect
					throw err;
				})
				.finally(() => {
					loading.value = false;
					loadingSpinner.close();
				});
		});

		function changeCategory(): void {
			void postOapi("/api/saved_categories", []);
		}

		function select({ item, value }: { item: SavedContent; value: boolean }) {
			item.isSelected = value;
			if (value) {
				selectedItem.push(item);
			} else {
				const index = selectedItem.indexOf(item);
				selectedItem.splice(index, 1);
			}
		}

		// later accessibility
		// later manage tablet/phone/4k

		return {
			itemPerPage,
			numberItems,
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
			categoriesList,
			selectAll,
			searchInput,
			updateInput,
			sideFilteredItem,

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
