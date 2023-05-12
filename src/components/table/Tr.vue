<template>
  <div>
    <div
      :class="[
        'tree-row',
        row.status ? 'del_line' : '',
        border ? 'tr' : 'tr-border',
        !rowMoveSort ? 'hide-move' : '',
      ]"
      :data-level="depth"
      :tree-id="row[custom_field.id]"
      :tree-p-id="row[custom_field.parent_id]"
      @click.stop="rowClick(row)"
    >
      <div
        v-for="col in formatColumn"
        :key="col.title"
        :class="[
          't-column',
          !col.width ? 'defaultWidth' : '',
          border ? 't_column_right_border' : '',
          col?.fixed ? 'stickyShadow' : '',
          col?.fixed == 'right' ? 'fixedRight' : col?.fixed == 'left' ? 'fixedLeft' : '',
        ]"
        :style="{
          textAlign: col.align,
          width: col.width ? col.width + 'px' : col.title.length * 26 + 'px',
          minWidth: col.width ? col.width + 'px' : col.title.length * 26 + 'px',
          maxWidth: col.width ? col.width + 'px' : col.title.length * 26 + 'px',
        }"
      >
        <!-- selection选择列 -->
        <span
          v-if="col.type === 'selection'"
          style="
            position: relative;
            display: flex;
            align-items: center;
            width: 100%;
            padding: 0 10px;
          "
        >
          <Space :depth="depth" />
          <span class="check">
            <input
              type="checkbox"
              class="checkbox"
              @click="(e) => (row[custom_field['checked']] = e.target.checked)"
              v-model="row[custom_field['checked']]"
            />
            <label for="check1"></label>
          </span>
          <span
            :draggable="!!isdraggable"
            @dragstart="dragstartchild($event)"
            @dragend="dragendchild($event)"
            class="move"
            v-if="!!isdraggable"
          >
            <svg
              t="1645584713511"
              class="icon"
              viewBox="0 0 1024 1024"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              p-id="2052"
              width="20"
              height="20"
            >
              <path
                d="M921.6 492.8l-121.6-121.6c-12.8-12.8-32-12.8-44.8 0s-12.8 32 0 44.8l66.133333 66.133333h-277.333333v-277.333333l66.133333 66.133333c6.4 6.4 14.933333 8.533333 23.466667 8.533334s17.066667-2.133333 23.466667-8.533334c12.8-12.8 12.8-32 0-44.8l-121.6-121.6c-12.8-12.8-32-12.8-44.8 0l-121.6 121.6c-12.8 12.8-12.8 32 0 44.8 12.8 12.8 32 12.8 44.8 0l66.133333-66.133333v277.333333h-277.333333l66.133333-66.133333c12.8-12.8 12.8-32 0-44.8-12.8-12.8-32-12.8-44.8 0l-121.6 121.6c-12.8 12.8-12.8 32 0 44.8l121.6 121.6c6.4 6.4 14.933333 8.533333 23.466667 8.533333s17.066667-2.133333 23.466666-8.533333c12.8-12.8 12.8-32 0-44.8l-66.133333-66.133333h277.333333v277.333333l-66.133333-66.133333c-12.8-12.8-32-12.8-44.8 0s-12.8 32 0 44.8l121.6 121.6c6.4 6.4 14.933333 8.533333 23.466667 8.533333s17.066667-2.133333 23.466666-8.533333l121.6-121.6c12.8-12.8 12.8-32 0-44.8s-32-12.8-44.8 0l-66.133333 66.133333v-277.333333h277.333333l-66.133333 66.133333c-12.8 12.8-12.8 32 0 44.8 6.4 6.4 14.933333 8.533333 23.466667 8.533333s17.066667-2.133333 23.466666-8.533333l121.6-121.6c6.4-6.4 8.533333-14.933333 8.533334-23.466667s-10.666667-14.933333-17.066667-21.333333z"
                p-id="2053"
                fill="#cdcdcd"
              ></path>
            </svg>
          </span>
          <span
            v-if="row[custom_field.children] && row[custom_field.children].length"
            class="zip-icon"
            @click="toggle"
            v-bind:class="[row[custom_field.open] ? 'arrow-bottom' : 'arrow-right']"
          >
          </span>
          <span v-else class="zip-icon arrow-transparent"> </span>
          <Td v-if="col.formatter" :width="col.width" :align="col.align">
            <span>{{ col.formatter(row) }}</span>
          </Td>
          <slot v-else name="selection" v-bind:row="row"></slot>
        </span>

        <!-- 操作列 -->
        <span v-else-if="col.type === 'action'" class="table_actions">
          <span v-if="col.actions">
            <a
              class="action-item"
              v-for="(acItem, acIndex) in col.actions"
              :key="acIndex"
              type="text"
              @click.stop.prevent="acItem.onclick(row)"
            >
              <i :class="acItem.icon" v-html="acItem.formatter(row)"></i>
              <i v-if="acIndex !== col.actions.length - 1" class="delimiter">/</i>
            </a>
          </span>
          <span v-else>
            <slot name="action" v-bind:row="row"></slot>
          </span>
        </span>
        <!-- 自定义渲染 formatter -->
        <div v-else-if="col.formatter" style="display: flex; flex: 1" class="formatterTd">
          <Td :width="col.width" :align="col.align">
            <span v-if="!row[`editIng_${col.prop}_${row.id}_${col.templateId}`]">
              {{ col.formatter(row) }}
            </span>
            <div v-else>
              <el-input
                v-if="col.inputType === 'input'"
                v-model="row[col.prop]"
                placeholder="请输入"
                clearable
                type="text"
                style="width: 100%"
                @blur="
                  () => (row[`editIng_${col.prop}_${row.id}_${col.templateId}`] = false)
                "
              ></el-input>
              <el-select
                v-else-if="col.inputType === 'select'"
                v-model="row[col.prop]"
                style="width: 100%"
                placeholder="请选择"
                clearable
                @change="celChangeHandle($event, col, row)"
              >
                <el-option
                  v-for="item in col.options ?? []"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </el-option>
              </el-select>
              <el-date-picker
                v-model="row[col.prop]"
                v-else-if="col.inputType === 'datePick'"
                :type="col.dateType ?? 'year'"
                style="width: 100%"
                :format="col.dateFormat ?? 'YYYY-MM-DD'"
                :value-format="col.valueFormat ?? 'YYYY-MM-DD'"
                placeholder="请选择"
                @change="celChangeHandle($event, col, row)"
              >
              </el-date-picker>
            </div>

            <img
              v-if="
                !row.status &&
                col.isEdit &&
                !row[`editIng_${col.prop}_${row.id}_${col.templateId}`]
              "
              src="./icon/edit.svg"
              class="editIcon"
              alt=""
              @click="editIconClick(row, col)"
            />
          </Td>
        </div>
        <div
          v-else
          style="width: 100%; display: flex; align-items: center; padding: 0 10px"
          class="formatterTd"
        >
          <Td :width="col.width" :align="col.align">
            <span v-if="!row[`editIng_${col.prop}_${row.id}_${col.templateId}`]">{{
              row[col.prop]
            }}</span>
            <div v-else>
              <el-input
                v-if="col.inputType === 'input'"
                v-model="row[col.prop]"
                placeholder="请输入"
                clearable
                type="text"
                style="width: 100%"
                @blur="
                  () => (row[`editIng_${col.prop}_${row.id}_${col.templateId}`] = false)
                "
              ></el-input>
              <el-select
                v-else-if="col.inputType === 'select'"
                v-model="row[col.prop]"
                style="width: 100%"
                placeholder="请选择"
                clearable
                @change="celChangeHandle($event, col, row)"
              >
                <el-option
                  v-for="item in col.options ?? []"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </el-option>
              </el-select>
              <el-date-picker
                v-model="row[col.prop]"
                v-else-if="col.inputType === 'datePick'"
                :type="col.dateType ?? 'year'"
                style="width: 100%"
                :format="col.dateFormat ?? 'YYYY-MM-DD'"
                :value-format="col.valueFormat ?? 'YYYY-MM-DD'"
                placeholder="请选择"
                @change="celChangeHandle($event, col, row)"
              >
              </el-date-picker>
            </div>

            <img
              v-if="
                !row.status &&
                col.isEdit &&
                !row[`editIng_${col.prop}_${row.id}_${col.templateId}`]
              "
              src="./icon/edit.svg"
              class="editIcon"
              alt=""
              @click="editIconClick(row, col)"
          /></Td>
        </div>
      </div>
      <!-- 拖拽移动浅蓝色背景 -->
      <div class="hover-model" style="display: none">
        <div class="hover-block prev-block">
          <i></i>
        </div>
        <div class="hover-block center-block">
          <i></i>
        </div>
        <div class="hover-block next-block">
          <i></i>
        </div>
      </div>
    </div>
    <!-- children递归渲染 -->
    <div v-if="isFolder">
      <Tr
        v-show="row[custom_field.open]"
        v-for="(item, index) in row[custom_field.children]"
        :key="index"
        :columns="columns"
        :depth="depth * 1 + 1"
        :row="item"
        @rowClick="rowClick"
        @onTdChange="tdChangeHandle"
      />
    </div>
  </div>
</template>

<script setup>
import Td from "./Td.vue";
import Space from "./space.vue";
import { ref, reactive, inject, provide, computed, onMounted } from "vue";
const emits = defineEmits(["rowClick", "tdClick", "onTdChange"]);
const props = defineProps({
  row: {
    type: Object,
    default: () => {},
  },
  columns: {
    type: Array,
    default: () => [],
  },
  depth: {
    type: Number,
    default: 0,
  },
});
const custom_field = inject("custom_field");
const isdraggable = ref(true);
const status = ref(false);
const border = inject("border");
const rowMoveSort = inject("rowMoveSort");
const modelValue = inject("modelValue");
const isFolder = computed(() => {
  return props.row[custom_field.children] && props.row[custom_field.children].length;
});
/**
 * 表格单元格操作
 */
const celChangeHandle = async (value, col, row) => {
  console.log(col.inputType);
  const taskExecute = row.taskExecuteList.find((e) => e.templateId == col.templateId);
  const taskExecuteEditObj = {
    id: taskExecute?.id ?? "",
    taskId: row.id,
    templateId: col.templateId,
  };
  taskExecuteEditObj[col.prop] = value;
  if (col.inputType == "select") {
    const label = col.options.filter((e) => e.value == value)[0]?.label ?? "";
    taskExecuteEditObj[`${col.prop}Str`] = label;
  }
  if (taskExecute) {
    taskExecute[col.prop] = value;
    if (col.inputType == "select") {
      const label = col.options.filter((e) => e.value == value)[0]?.label ?? "";
      taskExecute[`${col.prop}Str`] = label;
    }
  } else {
    row.taskExecuteList.push(taskExecuteEditObj);
  }
  row[`editIng_${col.prop}_${row.id}_${col.templateId}`] = false;
  emits("onTdChange", { value, col, row });
};

const tdChangeHandle = (e) => {
  emits("onTdChange", e);
};

const toggle = () => {
  props.row[custom_field.open] = !props.row[custom_field.open];
};
const treeToArray = (tree) => {
  return tree.reduce((res, item) => {
    const { children, ...i } = item;
    return res.concat(item, children && children.length ? treeToArray(children) : []);
  }, []);
};

const formatColumn = computed(() => {
  return treeToArray(props.columns).filter((e) => !e.children);
});

/**
 * 编辑图标点击事件
 */
const editIconClick = (row, col) => {
  const iconState = row[`editIng_${col.prop}_${row.id}_${col.templateId}`];
  row[`editIng_${col.prop}_${row.id}_${col.templateId}`] = !iconState;
  tdStateChange(row, `editIng_${col.prop}_${row.id}_${col.templateId}`);
};

/**
 * 改变（除当前正在编辑的）单元格状态
 * @param {object} row 当前行
 * @param {string} curKey 当前正在编辑的单元格
 */
const tdStateChange = (row, curKey) => {
  const regex = /editIng_/;
  const fn = (arr) => {
    arr.forEach((res) => {
      const keys = Object.keys(res).filter((e) => regex.test(e));
      if (keys.length > 0) {
        keys.forEach((v) => {
          if (v !== curKey) {
            res[v] = false;
          }
        });
      }
      if (res?.children?.length > 0) {
        fn(res.children);
      }
    });
  };
  fn(modelValue);
};

const dragstartchild = (e) => {
  window.dragId = e.target.parentNode.parentNode.parentNode.parentNode.children[0].getAttribute(
    "tree-id"
  );
  window.dragPId = e.target.parentNode.parentNode.parentNode.parentNode.children[0].getAttribute(
    "tree-p-id"
  );
  window.dragParentNode = e.target.parentNode.parentNode.parentNode.parentNode;
  e.target.parentNode.parentNode.parentNode.parentNode.style.opacity = 0.2;
};
const dragendchild = (e) => {
  e.target.parentNode.parentNode.parentNode.parentNode.style.opacity = 1;
};
const rowClick = (row) => {
  emits("rowClick", row);
};
</script>
<style scoped lang="scss">
.t-column {
  position: relative;
  color: #666;
  font-size: 14px;
  padding: 6px 0;
  width: 100%;
  display: flex;
  line-height: 30px;
  .table_actions {
    flex: 1;
    display: flex;
    padding: 0 10px;
    span {
      flex: 1;
      .action-item {
        cursor: pointer;
        .delimiter{
          margin:0 4px;
        }
      }
    }
  }
  .check {
    position: relative;
    display: flex;
    align-items: center;
    z-index: 2;
    input[type="checkbox"] {
      width: 1.2em;
      height: 1.2em;
      display: inline-block;
      text-align: center;
      vertical-align: baseline;
      line-height: 1.2em;
      position: relative;
      border-radius: 50%;
      outline: none;
      -webkit-appearance: none;
      border: 1px solid #fff;
      -webkit-tab-highlight-color: rgba(0, 0, 0, 0);
      color: #fff;
      background: #fff;
      margin-left: 3px;
    }

    input[type="checkbox"]::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      background: #fff;
      width: 100%;
      height: 100%;
      border: 1px solid #999999;
      border-radius: 50%;
      color: #fff;
      cursor: pointer;
    }

    input[type="checkbox"]:checked::before {
      content: "\2713";
      position: absolute;
      top: -1px;
      left: -1px;
      width: 100%;
      color: green;
      border-radius: 50%;
      cursor: pointer;
    }
  }
}
.t_column_right_border {
  border-right: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
}
.tree-row {
  position: relative;
}
.del_line {
  background: #f2f2f2 !important;
  .td {
    color: #ccc !important;
  }
  &::after {
    content: no-open-quote;
    position: absolute;
    top: 51%;
    left: 0;
    width: 100%;
    border-bottom: 1px solid #d4d4d4;
  }
}
.hide-move {
  &:hover {
    .move {
      display: none !important;
    }
  }
}
.tr {
  display: flex;
  border-left: 1px solid #f0f0f0;
  &:hover {
    .move {
      display: flex;
    }
  }
}
.formatterTd {
  display: flex;
  align-items: center;
  .editIcon {
    cursor: pointer;
    width: 15px;
    height: 15px;
    visibility: hidden;
  }
  &:hover {
    .editIcon {
      visibility: visible;
    }
  }
}
.tr-border {
  display: flex;
  border-bottom: 1px solid #f0f0f0;
  &:hover {
    .move {
      display: flex;
    }
  }
}
.defaultWidth {
  flex: 1;
}
.zip-icon {
  display: inline-block;
  width: 12px;
  z-index: 2;
  height: 12px;
  vertical-align: middle;
  background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAf0lEQVQ4T7XT0Q2AMAhF0dvNdALdSEdzBB3BDXQD85LGRNMCauS7nAKBxMdIhfwemIAtYpeAEeiANoLUgAGYI4gFqAMX8QAXiQBCNFDNRBVdIgpUkSfADjT3KqLACmg/XrWw5J+Li+VVYCZrMBbgJluA+tXA3Hv45ZgiR3i+OQBeSyYRPEyeUAAAAABJRU5ErkJggg==")
    no-repeat center;
  background-size: cover;
  margin-right: 5px;
}
.zip-icon:hover {
  cursor: pointer;
}
.arrow-transparent {
  visibility: hidden;
}
.arrow-right {
}
.arrow-bottom {
  transition: all 0.5s;
  transform: rotate(90deg);
}

.hover-model {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.6);

  .hover-block {
    display: flex;
    opacity: 0.1;
    transition: opacity 0.5s;
    justify-content: center;
    align-items: center;
  }
  .hover-block i {
    color: #fff;
  }
  .prev-block {
    height: 10%;
    background: #a4cefd;
  }
  .center-block {
    height: 80%;
    background: #a4cefd;
  }
  .next-block {
    height: 10%;
    background: #a4cefd;
  }
}
.move {
  position: absolute;
  right: 10px;
  justify-content: center;
  align-items: center;
  display: none;
}
.move:hover {
  cursor: pointer;
}
.fixedRight {
  position: sticky;
  background: #fff;
  right: 0;
}
.fixedLeft {
  position: sticky;
  left: 0;
}
</style>
