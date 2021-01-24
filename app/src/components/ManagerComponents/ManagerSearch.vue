<template>
  <el-autocomplete
    v-model="searchInputCompt"
    placeholder="Search"
    name="searchInput"
    clearable
    :trigger-on-focus="false"
    :fetch-suggestions="getSuggestion"
    @clear="clear"
  />
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  ComputedRef,
  PropType,
  useContext
} from "vue";
import SavedContent from "@/object/savedContent";

export default defineComponent({
  name: "ManagerSearch",
  props: {
    filteredItems: {
      required: true,
      type: Array as PropType<SavedContent[]>
    },
    searchInput: {
      required: true,
      type: String
    }
  },
  emits: ["updateInput"],
  setup(props) {
    const context = useContext();
    const searchInputCompt = computed({
      get: () => props.searchInput,
      set: val => context.emit("updateInput", val)
    });

    const listTitle: ComputedRef<string[]> = computed(() => {
      const array = new Set<string>();
      props.filteredItems.forEach((el: SavedContent) => {
        array.add(el.title);
      });
      return [...array].sort((el1, el2) => el1.localeCompare(el2));
    });

    function getSuggestion(query: string, cb: (arg: unknown) => unknown) {
      const array: string[] = [];
      array.push(...listTitle.value);

      if (!query) {
        cb(array);
      }
      const res: { value: string }[] = [];

      array.forEach(content => {
        if (content.toLowerCase().includes(query.toLowerCase())) {
          res.push({ value: content });
        }
      });
      cb(res);
    }

    function clear() {
      searchInputCompt.value = "";
    }

    return {
      getSuggestion,
      clear,
      searchInputCompt
    };
  }
});
</script>

<style lang="scss" scoped></style>
