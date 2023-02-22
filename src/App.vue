<template>
  <div>
    <SorTable
      :columns="table.columns"
      v-model="table.data"
      rowMoveSort
      :custom_field="table.custom_field"
    />
  </div>
</template>

<script setup>
import SorTable from "./components/SorTable.vue";
import { reactive, onBeforeMount, onMounted, watchEffect } from "vue";
import { meuns } from "./assets/menus.js";
const table = reactive({
  custom_field: {
    id: "id",
    parent_id: "parent_id",
    sortNum: "sortNum",
    children: "children",
    open: "open",
    checked: "checked",
    highlight: "highlight",
  },
  data: [],
  columns: [
    {
      type: "selection",
      title: "菜单名称",
      prop: "name",
      align: "left",
      titleAlign: "left",
      width: 200,
      formatter: (item) => {
        return item.name;
      },
    },
    {
      title: "URL地址",
      prop: "url",
      align: "center",
      formatter: (item) => {
        return item.url;
      },
    },
    {
      title: "启用",
      prop: "enable",
      align: "center",
      width: 100,
      type: "customize", // 自定义 样式 可以是
      formatter: (item) => {
        return item.enable ? "是" : "否";
      },
    },
    {
      title: "公开",
      prop: "isPublic",
      align: "center",
      width: 100,
      type: "customize",
      formatter: (item) => {
        return item.isPublic ? "是" : "否";
      },
    },
    {
      title: "操作",
      type: "action",
      width: 150,
      align: "center",
      // flex:1,
      actions: [
        {
          text: "编辑",
          onclick: (item) => {
            console.log(item);
          },
          formatter: () => {
            return '<svg t="1644904818707" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2053" width="14" height="14"><path d="M257.7 752c2 0 4-0.2 6-0.5L431.9 722c2-0.4 3.9-1.3 5.3-2.8l423.9-423.9c3.9-3.9 3.9-10.2 0-14.1L694.9 114.9c-1.9-1.9-4.4-2.9-7.1-2.9s-5.2 1-7.1 2.9L256.8 538.8c-1.5 1.5-2.4 3.3-2.8 5.3l-29.5 168.2c-1.9 11.1 1.5 21.9 9.4 29.8 6.6 6.4 14.9 9.9 23.8 9.9z m67.4-174.4L687.8 215l73.3 73.3-362.7 362.6-88.9 15.7 15.6-89zM880 836H144c-17.7 0-32 14.3-32 32v36c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-36c0-17.7-14.3-32-32-32z" p-id="2054" fill="royalblue"></path></svg>';
          },
        },
        {
          text: "删除",
          onclick: (item) => {
            console.log(item);
          },
          formatter: () => {
            return "<i style='margin-left:10px'>删除</i>";
          },
        },
      ],
    },
  ],
});
const handleMeunsList = (meuns) => {
  let tempArr = [];
  meuns.forEach((item, index) => {
    tempArr.push({
      id: item.menuId,
      parent_id: item.parentMenuId,
      name: item.menuName,
      url: item.resourceUrl,
      menuDescription: item.menuDescription,
      open: false,
      enable: item.enable,
      isPublic: item.isPublic,
    });
    if (item.children) {
      tempArr[index].children = handleMeunsList(item.children);
    }
  });
  return tempArr;
};
onBeforeMount(() => {
  table.data = handleMeunsList(meuns.result);
});
onMounted(() => {});
watchEffect(() => {});
</script>
<style scoped lang="scss">
* {
  margin: 0;
  padding: 0;
}
</style>
