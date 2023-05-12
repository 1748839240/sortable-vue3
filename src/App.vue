<template>
  <div>
    <SorTable
      :columns="table.columns"
      v-model="table.data"
      :height="500"
      :width="1000"
      rowMoveSort
      @rowClick="rowClick"
      @onTdChange="onTdChange"
      @treeSort="treeSort"
      :custom_field="table.custom_field"
    />
    <button @click="changeHeader">切换表头</button>
  </div>
</template>

<script setup>
import SorTable from "./components/SorTable.vue";
import { reactive, onBeforeMount, onMounted, watchEffect } from "vue";
import { meuns } from "./assets/menus.js";
import { treeGridJson } from "./assets/data";
const table = reactive({
  custom_field: {
    id: "id",
    parent_id: "parent_id",
    sortNum: "sortNum",
    children: "children",
    open: "open",
    checked: "status",
    highlight: "highlight",
  },
  data: [],
  columns: [],
});
const getTaskValue = (tempId, prop, arr) => {
  if (arr && arr.length > 0) {
    const curTempItem = arr.find((e) => e.templateId == tempId);
    if (curTempItem && curTempItem[prop]) {
      // if (item.prop == "planEndTime" || item.prop == "endTime") {
      //   console.log(curTempItem);
      //   return dayjs(curTempItem[item.prop]).format("YYYY-MM-DD");
      // }
      return curTempItem[prop];
    } else {
      return "";
    }
  }
  return "";
};
const changeHeader = (event) => {
  table.columns = [
    {
      type: "selection",
      title: "任务名称",
      prop: "name",
      align: "left",
      titleAlign: "left",
      width: 260,
      formatter: (item) => {
        return item.name;
      },
    },
    {
      title: "ui设计",
      prop: "colType",
      align: "center",
      id: "1623271238299459586",
      children: [
        {
          prop: "enable",
          type: "selectInput",
          title: "负责人",
          valueProp: "fullName",
          isDict: false,
          width: 140,
          align: "center",
          optionsKey: "",
          formatter: (item) => {
            return getTaskValue("1623271238299459586", "fullName", item.taskExecuteList);
          },
        },
        {
          title: "计划结束时间",
          prop: "planEndTime",
          type: "dateTime",
          customDate: "",
          isEdit: true,
          align: "center",
          width: 140,
          formatter: (item) => {
            return getTaskValue(
              "1623271238299459586",
              "planEndTime",
              item.taskExecuteList
            );
          },
        },
        {
          title: "状态",
          prop: "executeState",
          type: "selectDict",
          isDict: true,
          width: 140,
          align: "center",
          optionsKey: "EXE_STATUS",
          formatter: (item) => {
            return getTaskValue(
              "1623271238299459586",
              "executeState",
              item.taskExecuteList
            );
          },
        },
      ],
    },
    {
      title: "运维",
      prop: "colType",
      align: "center",
      id: "1623636833708675073",
      children: [
        {
          title: "负责人",
          prop: "userId",
          valueProp: "fullName",
          type: "selectInput",
          align: "center",
          isDict: false,
          optionsKey: "",
          width: 140,
          formatter: (item) => {
            return getTaskValue("1623636833708675073", "fullName", item.taskExecuteList);
          },
        },
        {
          title: "状态",
          prop: "executeState",
          type: "selectDict",
          isDict: true,
          align: "center",
          optionsKey: "EXE_STATUS",
          width: 140,
          formatter: (item) => {
            return getTaskValue(
              "1623636833708675073",
              "executeState",
              item.taskExecuteList
            );
          },
        },
      ],
    },
  ];
};

const treeSort = () => {
  console.log(table.data);
};

const rowClick = (e) => {
  // console.log(e);
};

const onTdChange = (e) => {
  console.log(table.data);
};
const handleMeunsList = (meuns) => {
  let tempArr = [];
  meuns.forEach((item, index) => {
    tempArr.push({
      id: item.id,
      parent_id: item.parentId,
      name: item.name,
      ...item,
    });
    if (item.children) {
      tempArr[index].children = handleMeunsList(item.children);
    }
  });
  return tempArr;
};
onBeforeMount(() => {
  table.data = handleMeunsList(treeGridJson.data);
  table.columns = treeGridJson.fields;
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
