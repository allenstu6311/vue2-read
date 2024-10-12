//用於解析 html 標籤、元件名稱和屬性路徑的 unicode 字母。
export const unicodeRegExp =
  /a-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD/;

/**
 * 解析資料路徑
 * @param {String} path 'obj.list.a'
 * @returns vm['obj.list.a']
 */
const bailRE = new RegExp(`[^${unicodeRegExp.source}.$_\\d]`);
export function parsePath(path: string): any {
  if (bailRE.test(path)) return;
  const segments = path.split(".");  
  return function (obj: any) {
    for (let i = 0; i < segments.length; i++) {
      if (!obj) return;
      obj = obj[segments[i]];
    }
    return obj;
  };
}

/**
 * 檢查字串是否以 $ 或 _ 開頭
 */
export function isResvered(str: string): boolean {
  const c: any = (str + "").charAt(0);
  return c === 0x24 || c === 0x5f;
}

/**
 * 監聽一個屬性並返回value
 * @param obj 
 * @param key 
 * @param val any | function
 * @param enumerable 
 */
export function def(obj: Object, key: string, val: any, enumerable?: boolean) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true,
  });
}
