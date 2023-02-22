<template>
    <Tr v-for="(item, index) in modelValue" :key="index" :columns="columns" :row="item" />
</template>

<script setup>
import Tr from "./Tr.vue";
import Th from "./Th.vue";
import { ref, reactive } from "vue";
const data = reactive({});
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
</script>
<style scoped lang="scss"></style>
