<template>
  <div
    v-for="(item, index) in column"
    :key="item.prop"
    :fixed="item?.fixed"
    :class="[
      't-column',
      isChildren ? 'childrenClass' : !item.width ? 'defaultWidth' : '',
      item?.fixed == 'right' ? 'fixedRight' : item?.fixed == 'left' ? 'fixedLeft' : '',
    ]"
    :style="{
      lineHeight: item.children ? rank * 40 + 'px' : '',
      textAlign: item.align,
      width: item.width ? item.width + 'px' : item.title.length * 26 + 'px',
      minWidth: item.children
        ? childMainWidth(item.children, index) + item.children.length - 1 + 'px'
        : item.width
        ? item.width + 'px'
        : item.title.length * 26 + 'px',
      maxWidth: item.width ? item.width + 'px' : item.title.length * 26 + 'px',
    }"
  >
    <span>{{ item.title }}</span>
    <div v-if="item.children && item.children.length > 0" style="display: flex">
      <Th :column="item.children" isChildren />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
const data = reactive({});
const props = defineProps({
  column: {
    type: Array,
    default: () => [],
  },
  rank: {
    type: Number,
    default: 1,
  },
  isChildren: {
    type: Boolean,
    default: false,
  },
});
const childMainWidth = (arr, index) => {
  return arr.reduce((num, item) => {
    num += item.width ? item.width : item.title.length * 26;
    return num;
  }, 0);
};
</script>
<style scoped lang="scss">
.t-column {
  width: 100%;
  display: flex;
  justify-content: center;
  flex-direction: column;
  flex: 1;
  border: 1px solid #f0f0f0;
  background: #fafafa;
  // background: #d4d2d2;
  color: #000000e0;
  font-weight: 600;
  padding: 0;
  font-size: 14px;
  line-height: 80px;
  border-left: none;
  &:first-child {
    border-left: 1px solid #f0f0f0;
  }
}
.fixedRight {
  position: sticky;
  right: 0;
}
.fixedLeft {
  position: sticky;
  left: 0;
}
.defaultWidth {
  flex: 1;
  min-width: 100px;
  line-height: 40px;
  border-left: none;
}
.childrenClass {
  flex: 1;
  border-bottom: 0;
  line-height: 40px;
  border-left: none;
  &:first-child {
    border-left: none;
  }
  &:last-child {
    border-right: none;
  }
}
</style>
