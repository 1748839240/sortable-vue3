<template>
  <div
    :class="['t-column', !width ? 'defaultWidth' : '']"
    :style="{
      textAlign: props.align,
      width: width ? width + 'px' : '',
      minWidth: width ? width + 'px' : '',
    }"
  >
    <slot></slot>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
const data = reactive({});
const props = defineProps({
  width: {
    type: Number,
    default: 0,
  },
  align: {
    type: String,
    default: "left",
  },
});
</script>
<style scoped lang="scss">
.t-column {
  width: 100%;
  display: table-cell;
  border: 1px solid #f0f0f0;
  background: #fafafa;
  color: #000000e0;
  font-weight: 600;
  line-height: 30px;
  padding: 6px 10px;
  font-size: 14px;
  border-left: none;
  &:first-child {
    border-left: 1px solid #f0f0f0;
  }
}
.defaultWidth {
  flex: 1;
  min-width: 100px;
}
</style>
