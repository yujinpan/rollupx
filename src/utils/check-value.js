/**
 * 校验数组是否有效
 * @param {*} data
 * @return {boolean}
 */
export function checkValidArray(data) {
  return Array.isArray(data) && data.length;
}

/**
 * 校验一个简单值
 * @param {*} value
 * @return {boolean}
 */
export function checkValidValue(value) {
  return !!value || value === 0;
}
