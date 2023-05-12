<template>
  <div
    class="table_main"
    ref="scrollTable"
    :style="[
      width ? { width: width + 'px' } : {},
      height ? { height: height + 'px' } : {},
    ]"
    v-if="table.rank <= 2"
  >
    <div class="tHeader">
      <Th :column="props.columns" />
    </div>
    <div
      class="tBody"
      @dragover="draging"
      @dragend="drop"
      v-bind:style="{ width: scrollWidth + 'px' }"
    >
      <TBody
        v-model="props.modelValue"
        v-model:columns="props.columns"
        @rowClick="rowClick"
        @onTdChange="onTdChange"
      />
    </div>
  </div>
</template>

<script setup>
import Th from "./table/Th.vue";
import TBody from "./table/TBody.vue";
import { ref, reactive, onMounted, provide, useAttrs, watch, nextTick } from "vue";
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
  //单元格高度
  tdHeight: {
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
  //是否显示表格边框
  border: {
    type: Boolean,
    default: true,
  },
  //表头
  columns: {
    type: Array,
    default: () => [],
  },
  //表格绑定数据
  modelValue: {
    type: Array,
    default: () => [],
  },
  hightRowChange: String,
  beforeDragOver: Function,
});
const emits = defineEmits(["rowClick", "onTdChange"]);
provide("custom_field", props.custom_field);
provide("border", props.border);
provide("rowMoveSort", props.rowMoveSort);
provide("tdHeight", props.tdHeight);
provide("modelValue", props.modelValue);
const scrollTable = ref();
const table = reactive({
  isDraing: false,
  rank: 0,
  dragX: "",
  dragY: "",
  targetId: "",
  whereInsert: "",
});
const scrollWidth = ref(0);
const rowClick = (e) => {
  emits("rowClick", e);
};
const onTdChange = (e) => {
  emits("onTdChange", e);
};
const initTrWidth = () => {
  scrollWidth.value = 0;
  const child = document.querySelector(".tHeader").children;
  for (let i = 0; i < child.length; i++) {
    scrollWidth.value += (child[i].clientWidth ?? 0) + 1;
  }
};
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
  emits("update:modelValue", newList);
  emits("treeSort");
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
watch(
  () => props.columns,
  (e) => {
    nextTick(() => {
      initTrWidth();
    });
  }
);

//监听fixed列，动态添加样式
const fixedShadowListener = () => {
  const stickyHeader = document.querySelectorAll(".fixedRight")[0];
  const stickyRows = document.querySelectorAll(".fixedRight");
  const containerElement = stickyHeader.parentElement;
  const fixedPosition = stickyHeader.getAttribute("fixed");
  if (!fixedPosition) return;
  if (fixedPosition === "right") {
    stickyRows.forEach((res) => {
      res.classList.add("sticky-l-shadow");
    });
  }
  scrollTable.value.addEventListener("scroll", () => {
    const containerRect = containerElement.getBoundingClientRect();
    const stickyRect = stickyHeader.getBoundingClientRect();
    const distanceRight = containerRect.right - stickyRect.width;
    if (fixedPosition === "right") {
      if (distanceRight > 0) {
        stickyRows.forEach((res) => {
          res.classList.add("sticky-l-shadow");
        });
      } else {
        stickyRows.forEach((res) => {
          res.classList.remove("sticky-l-shadow");
        });
      }
    }
  });
};
onMounted(() => {
  table.rank = dragTableMethods.calculationLevel(props.columns);
  if (table.rank > 2) {
    console.warn("抱歉，目前仅支持到二级菜单！");
  }
  initTrWidth();

  fixedShadowListener();
});
</script>
<style scoped lang="scss">
:deep(.sticky-l-shadow) {
  border-left: 1px solid #fff;
  box-shadow: -2px 0 2px rgba($color: rgb(147, 147, 147), $alpha: 0.1);
}
.table_main {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: overlay;
  overflow: auto;
  .tHeader {
    width: 100%;
    display: flex;
  }
  .tBody {
    flex: 1;
  }
}
</style>
