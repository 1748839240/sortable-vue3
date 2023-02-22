<template>
  <div
    class="table_main"
    :style="[
      width ? { width: width + 'px' } : {},
      height ? { height: height + 'px' } : {},
    ]"
  >
    <div class="tHeader">
      <Th
        v-for="item in props.columns"
        :key="item.prop"
        class="th"
        :width="item.width"
        :align="item.align ?? 'left'"
      >
        {{ item.title }}
      </Th>
    </div>
    <div class="tBody" @dragover="draging" @dragend="drop">
      <TBody v-model="props.modelValue" :columns="columns" />
    </div>
  </div>
</template>

<script setup>
import Th from "./table/Th.vue";
import TBody from "./table/TBody.vue";
import { ref, reactive, onMounted, provide } from "vue";
import dragTableMethods from "./dragTableMethods";

const props = defineProps({
  custom_field: {
    type: Object,
    default: () => {
      return {
        id: "id",
        parent_id: "parent_id",
        sortNum: "sortNum",
        children: "children",
        open: "open",
        checked: "checked",
        highlight: "highlight",
      };
    },
  },
  onlySameLevelCanDrag: String || Number,
  tdheight: {
    type: Number,
    default: 30,
  },
  //表格宽度
  width: {
    type: Number || String,
    default: 0,
  },
  //是否允许拖拽行排序
  rowMoveSort: {
    type: Boolean,
    default: false,
  },
  //表格高度
  height: {
    type: Number || String,
    default: 0,
  },
  border: {
    type: Boolean,
    default: true,
  },
  columns: {
    type: Array,
    default: () => [],
  },
  modelValue: {
    type: Array,
    default: () => [],
  },
  hightRowChange: String,
  beforeDragOver: Function,
});
const emit = defineEmits();
provide("custom_field", props.custom_field);
provide("border", props.border);
provide("rowMoveSort", props.rowMoveSort);
const table = reactive({
  isDraing: false,
  dragX: "",
  dragY: "",
  targetId: "",
  whereInsert: "",
});
onMounted(() => {});

// 查找匹配的行，处理拖拽样式
const filter = (x, y) => {
  var rows = document.querySelectorAll(".tree-row");
  table.targetId = undefined;
  const dragRect = window.dragParentNode.getBoundingClientRect(); //
  const dragW = dragRect.left + window.dragParentNode.clientWidth;
  const dragH = dragRect.top + window.dragParentNode.clientHeight;
  if (x >= dragRect.left && x <= dragW && y >= dragRect.top && y <= dragH) {
    // 当前正在拖拽原始块不允许插入
    return;
  }
  let hoverBlock = undefined;
  let targetId = undefined;
  let whereInsert = "";
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rect = row.getBoundingClientRect();
    const rx = rect.left;
    const ry = rect.top;
    const rw = row.clientWidth;
    const rh = row.clientHeight;
    if (x > rx && x < rx + rw && y > ry && y < ry + rh) {
      const diffY = y - ry;
      const pId = row.getAttribute("tree-p-id");
      // 不允许改变层级结构，只能改变上下顺序逻辑
      if (props.onlySameLevelCanDrag !== undefined && pId !== window.dragPId) {
        return;
      }
      targetId = row.getAttribute("tree-id");
      hoverBlock = row.children[row.children.length - 1];
      var rowHeight = row.offsetHeight;
      if (diffY / rowHeight > 3 / 4) {
        whereInsert = "bottom";
      } else if (diffY / rowHeight > 1 / 4) {
        if (props.onlySameLevelCanDrag !== undefined) {
          // 不允许改变层级结构，只能改变上下顺序逻辑
          return;
        }
        whereInsert = "center";
      } else {
        whereInsert = "top";
      }
      break;
    }
  }
  if (targetId === undefined) {
    // 匹配不到清空上一个状态
    dragTableMethods.clearHoverStatus();
    whereInsert = "";
    return;
  }

  let canDrag = true;
  if (props.beforeDragOver) {
    const curRow = getItemById(props.modelValue, window.dragId);
    const targetRow = getItemById(props.modelValue, targetId);
    canDrag = beforeDragOver(curRow, targetRow, whereInsert);
  }
  if (canDrag == false) return;
  hoverBlock.style.display = "block";
  if (hoverBlock.className == "hover-model") {
    if (whereInsert == "bottom") {
      if (hoverBlock.children[2].style.opacity !== "0.5") {
        dragTableMethods.clearHoverStatus();
        hoverBlock.children[2].style.opacity = 0.5;
      }
    } else if (whereInsert == "center") {
      if (hoverBlock.children[1].style.opacity !== "0.5") {
        dragTableMethods.clearHoverStatus();
        hoverBlock.children[1].style.opacity = 0.5;
      }
    } else {
      if (hoverBlock.children[0].style.opacity !== "0.5") {
        dragTableMethods.clearHoverStatus();
        hoverBlock.children[0].style.opacity = 0.5;
      }
    }
  }
  table.targetId = targetId;
  table.whereInsert = whereInsert;
};
// 根据id获取当前行
const getItemById = (lists, id) => {
  var curItem = null;
  const listKey = props.custom_field.children;
  const idKey = props.custom_field.id;
  function getchild(curList) {
    for (let i = 0; i < curList.length; i++) {
      var item = curList[i];
      if (item[idKey] == id) {
        curItem = JSON.parse(JSON.stringify(item));
        break;
      } else if (item[listKey] && item[listKey].length) {
        getchild(item[listKey]);
      }
    }
  }
  getchild(lists);
  return curItem;
};
// 重置所有数据的顺序order
const resetOrder = (list) => {
  const listKey = props.custom_field.children;
  for (var i = 0; i < list.length; i++) {
    list[i][props.custom_field.sortNum] = i;
    if (list[i][listKey] && list[i][listKey].length) {
      resetOrder(list[i][listKey]);
    }
  }
};
const resetTreeData = () => {
  if (table.targetId === undefined) return;
  const listKey = props.custom_field.children;
  const parentIdKey = props.custom_field.parent_id;
  const idKey = props.custom_field.id;
  const newList = [];
  const curList = props.modelValue;
  let curDragItem = null;
  let taggetItem = null;
  function pushData(curList, needPushList) {
    for (let i = 0; i < curList.length; i++) {
      const item = curList[i];
      var obj = dragTableMethods.deepClone(item);
      obj[listKey] = [];
      if (table.targetId == item[idKey]) {
        curDragItem = getItemById(props.modelValue, window.dragId);
        taggetItem = getItemById(props.modelValue, table.targetId);
        if (table.whereInsert === "top") {
          curDragItem[parentIdKey] = item[parentIdKey];
          needPushList.push(curDragItem);
          needPushList.push(obj);
        } else if (table.whereInsert === "center") {
          curDragItem[parentIdKey] = item[idKey];
          obj.open = true;
          obj[listKey].push(curDragItem);
          needPushList.push(obj);
        } else {
          curDragItem[parentIdKey] = item[parentIdKey];
          needPushList.push(obj);
          needPushList.push(curDragItem);
        }
      } else {
        if (window.dragId != item[idKey]) {
          needPushList.push(obj);
        }
      }
      if (item[listKey] && item[listKey].length) {
        pushData(item[listKey], obj[listKey]);
      }
    }
  }
  pushData(curList, newList);
  resetOrder(newList);
  console.log(newList);
  emit("update:modelValue", newList);
};
const draging = (e) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
  table.isDraing = true;
  if (e.pageX == table.dragX && e.pageY == table.dragY) return;
  table.dragX = e.pageX;
  table.dragY = e.clientY;
  filter(e.pageX, e.clientY);
  if (e.clientY < 100) {
    window.scrollTo(0, scrollY - 6);
  } else if (e.clientY > document.body.clientHeight - 160) {
    window.scrollTo(0, scrollY + 6);
  }
};
const drop = () => {
  dragTableMethods.clearHoverStatus();
  resetTreeData();
  table.isDraing = false;
  if (table.targetId !== undefined) {
    if (props.hightRowChange !== undefined) {
      nextTick(() => {
        var rowEle = document.querySelector("[tree-id='" + window.dragId + "']");
        rowEle.style.backgroundColor = "rgba(64,158,255,0.3)";
        setTimeout(() => {
          rowEle.style.backgroundColor = "rgba(64,158,255,0)";
        }, 100);
      });
    }
  }
};
</script>
<style scoped lang="scss">
.table_main {
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: overlay;
  overflow: auto;
  .tHeader {
    width: 100%;
    display: flex;
  }
}
</style>
