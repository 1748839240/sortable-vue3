<template>
  <div>
    <Tr
      v-for="(item, index) in modelValue"
      :key="index"
      v-model:columns="props.columns"
      :row="item"
      @rowClick="rowClick"
      @onTdChange="onTdChange"
    />
  </div>
</template>

<script setup>
import Tr from "./Tr.vue";
import Th from "./Th.vue";
import { ref, reactive } from "vue";
const data = reactive({});
const emits = defineEmits(["rowClick", "tdClick","onTdChange"]);
const props = defineProps({
  columns: {
    type: Array,
    default: () => [],
  },
  modelValue: {
    type: Array,
    default: () => [],
  },
});
const rowClick = (e) => {
  emits("rowClick", e);
};
const onTdChange = (e) => {
  emits("onTdChange", e);
};
</script>
<style scoped lang="scss"></style>
