<template>
  <div>
    <div
      :class="['tree-row', border ? 'tr' : 'tr-border', !rowMoveSort ? 'hide-move' : '']"
      :data-level="depth"
      :tree-id="row[custom_field.id]"
      :tree-p-id="row[custom_field.parent_id]"
    >
      <div
        v-for="col in columns"
        :key="col.title"
        :class="[
          't-column',
          !col.width ? 'defaultWidth' : '',
          border ? 't_column_right_border' : '',
        ]"
        :style="{
          textAlign: col.align,
          width: col.width ? col.width + 'px' : '',
          minWidth: col.width ? col.width + 'px' : '',
        }"
      >
        <span
          v-if="col.type === 'selection'"
          style="position: relative; display: flex; align-items: center; width: 100%"
        >
          <Space :depth="depth" />
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
            {{ col.formatter(row) }}
          </Td>
          <slot v-else name="selection" v-bind:row="row"></slot>
        </span>
        <span v-else-if="col.type === 'action'" class="table_actions">
          <span v-if="col.actions">
            <a
              class="action-item"
              v-for="(acItem, acIndex) in col.actions"
              :key="acIndex"
              type="text"
              size="small"
              @click.stop.prevent="acItem.onclick(row)"
            >
              <i :class="acItem.icon" v-html="acItem.formatter(row)"></i>
            </a>
          </span>
          <span v-else>
            <slot name="action" v-bind:row="row"></slot>
          </span>
        </span>
        <Td v-else-if="col.formatter" :width="col.width" :align="col.align">
          {{ col.formatter(row) }}
        </Td>
        <Td v-else :width="col.width" :align="col.align">{{ row[col.prop] }}</Td>
      </div>
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
    <div v-if="isFolder">
      <Tr
        v-show="row[custom_field.open]"
        v-for="(item, index) in row[custom_field.children]"
        :key="index"
        :columns="columns"
        :depth="depth * 1 + 1"
        :row="item"
      />
    </div>
  </div>
</template>

<script setup>
import Td from "./Td.vue";
import Space from "./space.vue";
import { ref, reactive, inject, computed } from "vue";
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
const border = inject("border");
const rowMoveSort = inject("rowMoveSort");
const isFolder = computed(() => {
  return props.row[custom_field.children] && props.row[custom_field.children].length;
});
const toggle = () => {
  props.row[custom_field.open] = !props.row[custom_field.open];
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
</script>
<style scoped lang="scss">
.t-column {
  position: relative;
  color: #666;
  font-size: 14px;
  padding: 6px 10px;
  width: 100%;
  display: flex;
  line-height: 30px;
  .table_actions {
    flex: 1;
    display: flex;
    span {
      flex: 1;
    }
  }
}
.t_column_right_border {
  border-right: 1px solid #f0f0f0;
}
.tree-row {
  position: relative;
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
  border: 1px solid #f0f0f0;
  border-right: none;
  border-top: none;
  &:hover {
    .move {
      display: flex;
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
  min-width: 100px;
}
.zip-icon {
  display: inline-block;
  width: 12px;
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
  right: 0;
  justify-content: center;
  align-items: center;
  display: none;
}
.move:hover {
  cursor: pointer;
}
</style>
