/**
 * 校验数组是否有效
 * @param {*} data
 * @return {boolean}
 */
export function isValidArray(data: any): data is any[] {
  return !!(Array.isArray(data) && data.length);
}

/**
 * 校验一个简单值
 * @param {*} value
 * @return {boolean}
 */
export function isValidValue<T>(value: any): value is T {
  return !['undefined', 'null'].includes(typeof value) && value !== '';
}
