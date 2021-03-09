<template>
	<el-menu>
		<el-submenu index="1">
			<template #title>
				<i class="el-icon-location"></i>
				<span>Post</span>
			</template>
			<div v-for="el in type" :key="el">
				<el-button
					:class="{ selected: isSelected(el, typeFilter) }"
					type="text"
					@click="changeFilter('el', typeFilter)"
				>
					{{ "el" }}
				</el-button>
			</div>
		</el-submenu>
		<el-submenu index="2">
			<template #title>
				<i class="el-icon-menu"></i>
				<span> Category </span>
			</template>
			<template v-if="isGold">
				<div v-for="el in categoriesList" :key="el">
					<el-button
						:class="{ selected: isSelected('el', categoryFilter) }"
						type="text"
						@click="changeFilter('el', categoryFilter)"
					>
						{{ "el" }}
					</el-button>
				</div>
			</template>
			<i v-else>Need Reddit Premium</i>
		</el-submenu>
		<el-submenu index="3">
			<template #title>
				<i class="el-icon-menu"></i>
				<span> Subreddit </span>
			</template>
			<!-- //warning Using el-menu-item cause infinite loop : ToReport -->
			<div
				v-for="subreddit in subredditList"
				:key="subreddit"
				:index="subreddit"
			>
				<!--{{ tellMeCall(subreddit) }}-->
				<el-button
					:class="{ selected: isSelected(subreddit, subredditFilter) }"
					type="text"
					@click="changeFilter(subreddit, subredditFilter)"
				>
					{{ subreddit }}
				</el-button>
			</div>
		</el-submenu>
	</el-menu>
</template>

<script lang="ts">
import { PostType } from "@/enum/postType";
import { defineComponent, PropType, useContext } from "vue";

export default defineComponent({
	name: "ManagerSideMenu",
	props: {
		isGold: {
			required: true,
			type: Boolean,
		},
		typeFilter: {
			required: true,
			type: Array as PropType<string[]>,
		},
		categoryFilter: {
			required: true,
			type: Array as PropType<string[]>,
		},
		subredditFilter: {
			required: true,
			type: Array as PropType<string[]>,
		},
		subredditList: {
			required: true,
			type: Array as PropType<string[]>,
		},
		categoriesList: {
			required: true,
			type: Array as PropType<string[]>,
		},
	},
	emits: ["changeFilter"],
	setup() {
		const type: string[] = Object.values(PostType);
		const context = useContext();

		function changeFilter(el: string, list: string[]) {
			context.emit("changeFilter", el, list);
		}

		function tellMeCall(el: string) {
			console.log(`call  ${el}`);
		}

		function isSelected(el: string, array: string[]): boolean {
			if (array) {
				return array.includes(el);
			}
			return false;
		}

		return {
			type,
			PostType,
			isSelected,
			changeFilter,
			tellMeCall,
		};
	},
});
</script>

<style scoped>
.el-menu {
	background-color: #1a1a1b;
	color: white;
}

.el-submenu__title {
	color: white;
}

.el-menu {
	height: 100px;
}
.el-submenu,
.el-menu-item {
	color: white;
}
.el-menu:not(.el-menu--collapse) {
	width: 200px;
	min-height: 400px;
	width: 100%;
}

.el-aside {
	overflow-x: visible;
	overflow-y: visible;
}

.selected {
	color: red !important;
}
.el-button:focus,
.el-button--text:focus {
	color: none;
}
</style>
