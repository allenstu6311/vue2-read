export const emptyObject: Record<string, any> = Object.freeze({});

export const isArray = Array.isArray;

/**
 * 元素是undefind || null
 */
export function isUndef(v: any): v is undefined | null {
  return v === undefined || v === null;
}

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
 * 檢查是否為物件
 */
export function isObject(obj: any): boolean {
  return obj !== null && typeof obj === "object";
}

/**
 * 檢查傳入的變量是否為「純物件」，例:new Object()，確保
 * 不是由自定義的函數制作
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

/**
 * Mix properties into target object.
 */
export function extend(
  to: Record<PropertyKey, any>,
  _from?: Record<PropertyKey, any>
): Record<PropertyKey, any> {
  for (const key in _from) {
    to[key] = _from[key];
  }
  return to;
}

/**
 * 傳回數字
 */
export function toNumber(val: string): number | string {
  const n = parseFloat(val);
  return isNaN(n) ? val : n;
}

/**
 * 檢查是否為原始值(string | number | symbol | boolean)
 */
export function isPrimitive(value: any): boolean {
  return (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "symbol" ||
    typeof value === "boolean"
  );
}

export function isTrue(v: any): boolean {
  return v === true;
}

/**
 * 此物件不是undefind也不是null
 */
export function isDef<T>(v: T): v is NonNullable<T> {
  return v !== undefined && v !== null;
}

export function isFalse(v: any): boolean {
  return v === false;
}

/**
 * 製作一個hashMap來檢查標籤
 */
export function makeMap(
  str: string,
  expectsLowerCase?: boolean
): (key: string) => true | undefined {
  const map = Object.create(null);
  const list: Array<string> = str.split(",");

  for (let i = 0; i < list.length; i++) {
    map[list[i]] = true;
  }

  return expectsLowerCase
    ? (val) => map[val.toLocaleLowerCase()]
    : (val) => map[val];
}

export function toString(val: any): string {
  return val == null
    ? ""
    : Array.isArray(val) || (isPlainObject(val) && val.toString === _toString)
    ? JSON.stringify(val, replacer, 2)
    : String(val);
}

function replacer(_key: string, val: any): any {
  // avoid circular deps from v3
  if (val && val.__v_isRef) {
    return val.value;
  }
  return val;
}

/**
 * 綁定函數執行上下文
 * @param fn method
 * @param ctx vm
 * @returns method
 */
function nativeBind(fn: Function, ctx: Object): Function {
  return fn.bind(ctx);
}

// @ts-expect-error bind cannot be `undefined`
export const bind = Function.prototype.bind ? nativeBind : noop;

/**
 * 將字串大寫
 */
export const capitalize = cached((str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
});

/**
 * myComponentName => my-component-name
 */
const hyphenateRE = /\B([A-Z])/g;
export const hyphenate = cached((str: string): string => {
  return str.replace(hyphenateRE, "-$1").toLowerCase();
});

/**
 * Convert an Array-like object to a real Array.
 */
export function toArray(list: any, start?: number): Array<any> {
  start = start || 0;
  let i = list.length - start;
  const ret: Array<any> = new Array(i);
  while (i--) {
    ret[i] = list[i + start];
  }
  return ret;
}
