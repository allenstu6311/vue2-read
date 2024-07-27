export interface SimpleSet {
  has(key: string | number): boolean;
  add(key: string | number): any;
  clear(): void;
}

// Firefox has a "watch" function on Object.prototype...
// @ts-expect-error firebox support
export const nativeWatch = {}.watch

/**
 * 檢查函數是否為原生(通常原生js函數轉換成字串會包含"native code"的字樣)
 * @param Ctor
 * @returns Boolean
 */
export function isNative(Ctor: any): boolean {
  return typeof Ctor === "function" && /native code/.test(Ctor.toString());
}

/**
 * 是否支持Symbol以及Reflect.ownKeys方法
 */
export const hasSymbol =
  typeof Symbol !== "undefined" &&
  isNative(Symbol) &&
  typeof Reflect !== "undefined" &&
  isNative(Reflect.ownKeys);
