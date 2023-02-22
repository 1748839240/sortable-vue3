<template>
  <div class="td">
    <slot></slot>
  </div>
</template>

<script setup>
import { ref, reactive, inject } from "vue";
const border = inject("border");
const data = reactive({});
</script>
<style scoped lang="scss">
.td {
  height: 100%;
  flex:1;
}
</style>
