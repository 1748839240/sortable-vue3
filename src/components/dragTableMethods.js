
const dragTableMethods = {
  clearHoverStatus() {
    var rows = document.querySelectorAll('.tree-row')
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const hoverBlock = row.children[row.children.length - 1]
      hoverBlock.style.display = 'none'
      if (hoverBlock.className === 'hover-model') {
        hoverBlock.children[0].style.opacity = 0.1
        hoverBlock.children[1].style.opacity = 0.1
        hoverBlock.children[2].style.opacity = 0.1
      }
    }
  },
  getElementTop(element, tableRef) {
    // 固定表头
    let scrollTop = tableRef.querySelector('.drag-table-body').scrollTop
    var actualTop = element.offsetTop - scrollTop;
    var current = element.offsetParent;
    while (current !== null) {
      actualTop += current.offsetTop;
      current = current.offsetParent;
    }
    return actualTop
  },
  getElementLeft(element) {
    var actualLeft = element.offsetLeft;
    var current = element.offsetParent;
    while (current !== null) {
      actualLeft += current.offsetLeft;
      current = current.offsetParent;
    }
    return actualLeft
  },
  deepClone(aObject) {
    if (!aObject) {
      return aObject;
    }
    var bObject, v, k;
    bObject = Array.isArray(aObject) ? [] : {};
    for (k in aObject) {
      v = aObject[k];
      bObject[k] = (typeof v === "object") ? dragTableMethods.deepClone(v) : v;
    }
    return bObject;
  },
  calculationLevel(arr) {
    //递归计算树形数据最大的层级数
    let maxLevel = 0;
    ! function multiArr(arr, level) {
      ++level;
      maxLevel = Math.max(level, maxLevel);
      for (let i = 0; i < arr.length; i++) {
        let item = arr[i];
        item.level = level;
        if (item.children && item.children.length > 0) {
          multiArr(item.children, level);
        } else {
          delete item.children;
        }
      }
    }(arr, 0);
    return maxLevel;
  }
}
export default dragTableMethods;