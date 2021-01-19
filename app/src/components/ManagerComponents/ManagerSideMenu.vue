<template>
  <el-menu class="el-menu-vertical-demo theSideMenu">
    <el-submenu index="1">
      <template #title>
        <i class="el-icon-location"></i>
        <span>Post</span>
      </template>
      <el-menu-item v-for="el in postType" :key="el">
        <el-button
          :class="{ selected: isSelected(el, typeFilter) }"
          type="text"
          @click="changeFilter(el, typeFilter)"
        >
          {{ el }}
        </el-button>
      </el-menu-item>
    </el-submenu>
    <el-submenu index="2">
      <template #title>
        <i class="el-icon-menu"></i>
        <span> Category </span>
      </template>
      <template v-if="isGold">
        <el-menu-item v-for="el in postType" :key="el">
          <el-button
            :class="{ selected: isSelected(el, categoryFilter) }"
            type="text"
            @click="changeFilter(el, categoryFilter)"
          >
            {{ el }}
          </el-button>
        </el-menu-item>
      </template>
      <i v-else>Need Reddit Premium</i>
    </el-submenu>
    <el-submenu index="3">
      <template #title>
        <i class="el-icon-menu"></i>
        <span> Subreddit </span>
      </template>
      <el-menu-item v-for="subreddit in subredditList" :key="subreddit">
        <el-button
          :class="{ selected: isSelected(subreddit, subredditFilter) }"
          type="text"
          @click="changeFilter(subreddit, subredditFilter)"
        >
          {{ subreddit }}
        </el-button>
      </el-menu-item>
    </el-submenu>
  </el-menu>
</template>

<script lang="ts">
"use strict";

import { defineComponent, PropType, useContext } from "vue";
import { postType } from "@/enum/postType";

export default defineComponent({
  name: "ManagerSideMenu",
  props: {
    isGold: {
      required: true,
      type: Boolean
    },
    typeFilter: {
      required: true,
      type: Array as PropType<string[]>
    },
    categoryFilter: {
      required: true,
      type: Array as PropType<string[]>
    },
    subredditFilter: {
      required: true,
      type: Array as PropType<string[]>
    },
    subredditList: {
      required: true,
      type: Array as PropType<string[]>
    }
  },
  emits: ["changeFilter"],
  setup() {
    const type: string[] = Object.keys(postType);
    const context = useContext();

    function changeFilter(el: string, list: string[]) {
      context.emit("changeFilter", el, list);
    }

    function isSelected(el: string, array: string[]): boolean {
      if (array) {
        return array.includes(el);
      } else {
        return false;
      }
    }

    return {
      type,
      postType,
      isSelected,
      changeFilter
    };
  }
});
</script>

<style scoped>
.TheSideMenu,
.el-menu {
  background-color: #1a1a1b;
  color: white;
}

.el-submenu__title {
  color: white;
}

.el-menu-vertical-demo {
  height: 100px;
}
.el-submenu,
.el-menu-item {
  color: white;
}
.el-menu-vertical-demo:not(.el-menu--collapse) {
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
