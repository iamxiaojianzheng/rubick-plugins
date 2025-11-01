function isNotEmpty(obj) {
  return !isEmpty(obj);
}

function isEmpty(obj) {
  if (obj == null) return true; // null 或 undefined
  if (typeof obj === "string") {
    return obj.trim().length === 0; // 空字符串或只含空格
  }
  if (Array.isArray(obj)) {
    return obj.length === 0; // 数组为空
  }
  if (typeof obj === "object") {
    return Object.keys(obj).length === 0; // 对象为空
  }
  if (typeof obj === "number") {
    return obj === 0 || isNaN(obj); // 判断 0 或 NaN
  }
  return false; // 对于其他类型的值，假定它们不是空的
}

function hideElement(element) {
  if (element instanceof HTMLElement) {
    element.style.display = "none";
  } else if (typeof element === "string") {
    document.querySelector(element).style.display = "none";
  }
}

function showElement(element) {
  if (element instanceof HTMLElement) {
    element.style.display = "block";
  } else if (typeof element === "string") {
    document.querySelector(element).style.display = "block";
  }
}

module.exports = {
  isEmpty,
  isNotEmpty,
  hideElement,
  showElement,
};
