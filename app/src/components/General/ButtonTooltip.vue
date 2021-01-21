<template>
  <el-tooltip :content="content" :placement="placement">
    <el-button :type="buttonType" @click="$emit('onClick')">
      <slot></slot>
    </el-button>
  </el-tooltip>
</template>

<script>
export default {
  name: "ButtonTooltip",
  props: {
    buttonType: {
      type: String,
      default: "text"
    },
    content: {
      required: true,
      type: String
    },
    placement: {
      type: String,
      default: "top"
    }
  },
  emits: ["onClick"]
};
</script>

<style lang="scss" scoped></style>
