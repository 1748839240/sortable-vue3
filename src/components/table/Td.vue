<template>
  <div class="td" :style="{ lineHeight: tdHeight + 'px' }">
    <slot></slot>
  </div>
</template>

<script setup>
import { ref, reactive, inject } from "vue";
const tdHeight = inject("tdHeight");
const data = reactive({});
</script>
<style scoped lang="scss">
.td {
  flex: 1;
  align-items: center;
}
</style>
