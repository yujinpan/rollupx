import { isValidValue } from '@/utils/validate';
import { Obj } from '@/types';

/**
 * 合并有效的对象
 * @param {Object} source
 * @param {Object} target
 * @returns Object
 */
export function mergeValidObj<T extends Object, S extends Object>(
  source: T,
  target: S
): T & Partial<S> {
  const obj: Partial<S> = {};
  for (let key in target) {
    if (target.hasOwnProperty(key) && isValidValue(target[key])) {
      obj[key] = target[key];
    }
  }
  return Object.assign({}, source, obj);
}

/**
 * 获取有效的对象属性
 * @param {Object} obj
 * @returns Object
 */
export function getValidObj<T extends Object>(obj: T): Partial<T> {
  const result: Partial<T> = {};
  let item;
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      item = obj[key];
      if (isValidValue(item)) {
        result[key] = item;
      }
    }
  }
  return result;
}

/**
 * 合并数组为对象
 * @param {Array} arr
 * @param {Function} cb example: (item) => ({ [item.id]: item.value })
 * @returns Object
 */
export function arrayReduce<T>(arr: T[], cb: (p: T) => Object): Obj {
  return arr.reduce((prev, next) => {
    return { ...prev, ...cb(next) };
  }, {});
}

/**
 * 获取字符串的键值 obj['a.b.c'] = obj.a.b.c
 * @param {object} obj
 * @param {string} strKeys
 */
export function getValueByKeyPath(obj: Obj, strKeys: string) {
  if (isValidValue(obj[strKeys])) {
    return obj[strKeys];
  }
  const keys = strKeys.split('.');
  let value = obj;
  for (let i = 0; i < keys.length; i++) {
    if (!isValidValue(value)) break;
    value = value[keys[i]];
  }
  return value;
}
