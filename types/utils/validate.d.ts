/**
 * 校验数组是否有效
 * @param {*} data
 * @return {boolean}
 */
export declare function isValidArray(data: any): data is any[];
/**
 * 校验一个简单值
 * @param {*} value
 * @return {boolean}
 */
export declare function isValidValue<T>(value: any): value is T;