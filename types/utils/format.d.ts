/**
 * 合并有效的对象
 * @param {Object} source
 * @param {Object} target
 * @returns Object
 */
export declare function mergeValidObj<T extends Object, S extends Object>(
  source: T,
  target: S
): T & Partial<S>;
/**
 * 获取有效的对象属性
 * @param {Object} obj
 * @returns Object
 */
export declare function getValidObj<T extends Object>(obj: T): Partial<T>;
/**
 * 合并数组为对象
 * @param {Array} arr
 * @param {Function} cb example: (item) => ({ [item.id]: item.value })
 * @returns Object
 */
export declare function arrayReduce<T>(
  arr: T[],
  cb: (p: T) => Object
): {
  [p: string]: any;
};
