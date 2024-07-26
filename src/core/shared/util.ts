export const isArray = Array.isArray;

const hasOwnProperty = Object.prototype.hasOwnProperty;
/**
 * 檢查物件是否有特定屬性
 */
export function hasOwn(obj: Object | Array<any>, key: string): boolean {
  return hasOwnProperty.call(obj, key);
}

/**
 * 取得值的原始型別字串，例如[object Object]
 */
const _toString = Object.prototype.toString;

export function isFunction(value: any): value is (...args: any[]) => any {
  return typeof value === "function";
}

/**
 * 嚴格的物件類型檢查
 */
export function isPlainObject(obj: any): boolean {
  return _toString.call(obj) === "[object Object]";
}

/**
 * 緩存轉換過的字串，如果有命中就返回緩存
 */
export function cached<R>(fn: (str: string) => R): (sr: string) => R {
  const cache: Record<string, R> = Object.create(null);
  return function cachedFn(str: string) {
    const hit = cache[str];
    return hit || (cache[str] = fn(str));
  };
}

/**
 * 轉換駝峰命名
 * data-test => dataTest
 */
const camelizeRE = /-(\w)/g;
export const camelize = cached((str: string): string => {
  return str.replace(camelizeRE, (_, c) => (c ? c.toUpperCase() : ""));
});

/**
 * 判斷陣列的index是否式有效的
 */
export function isValidArrayIndex(val: any): boolean {
  const n = parseFloat(String(val));
  // Math.floor(n) === n 確保n是整數
  // isFinite 瀏覽器原生API能夠判斷是否為有限數值
  return n >= 0 && Math.floor(n) === n && isFinite(val);
}

/**
 * 比較資料是否有變化與Object.is雷同
 * 但是在判斷+0 和 -0，NaN會有不同的結果
 */
export function hasChanged(x: unknown, y: unknown): boolean {
  if (x === y) return x === 0 && 1 / x !== 1 / (y as number);
  return x === x || y === y;
}

/**
 * 不執行任何操作，滿足某些需要函數但實際上不會被調用的情況，
 * 避免 undefined 錯誤或其他潛在的問題
 */
export function noop(a?: any, b?: any, c?: any) {}

/**
 * Always return false.
 */
export const no = (a?: any, b?: any, c?: any) => false;

/**
 * Return the same value.
 */
export const identity = (_: any) => _;
