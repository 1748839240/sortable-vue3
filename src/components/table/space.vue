<template>
  <span class="space-container">
    <span class="space" v-for="(item, index) in spaces" v-bind:key="index"></span>
  </span>
</template>
<script setup>
import { computed } from "vue";
const props = defineProps({
  depth: {
    type: Number,
    default: 0,
  },
});
const spaces = computed(() => {
  const aArr = [];
  for (let i = 0; i < props.depth; i++) {
    aArr.push("");
  }
  return aArr;
});
</script>
<style>
.space {
  display: inline-block;
  width: 15px;
}
</style>
