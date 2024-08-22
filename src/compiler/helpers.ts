import { ASTElement } from "../types/compiler.js";
import { parseFilters } from "./parser/filter-parser.js";

type Range = { start?: number; end?: number };
/**
 * 提醒編譯錯誤
 */
export function baseWarn(msg: string, range?: Range) {
  console.error(`[Vue compiler]: ${msg}`);
}

export function pluckModuleFunction<T, K extends keyof T>(
  modules: Array<T> | undefined,
  key: K
): Array<Exclude<T[K], undefined>> {
  return modules ? (modules.map((m) => m[key]).filter((_) => _) as any) : [];
}

/**
 * 在ASTElement移除指定的属性
 */
export function getAndRemoveAttr(
  el: ASTElement,
  name: string,
  removeFromMap?: boolean
): string | undefined {
  let val;
  // 如果属性存在于 attrsMap 中，获取其值
  if ((val = el.attrsMap[name]) != null) {
    const list = el.attrsList;
    for (let i = 0, l = list.length; i < l; i++) {
      if (list[i].name === name) {
        // 从 attrsList 中移除该属性
        list.splice(i, 1);
        break;
      }
    }
  }
  if (removeFromMap) {
    // 如果 removeFromMap 参数为真，从 attrsMap 中移除该属性
    delete el.attrsMap[name];
  }
  return val;
}

export function getBindingAttr(
  el: ASTElement,
  name: string,
  getStatic?: boolean
) {
  const dynamivValue =
    getAndRemoveAttr(el, ":" + name) || getAndRemoveAttr(el, "v-bind:" + name);

  if (dynamivValue != null) return parseFilters(dynamivValue);
  //   else if(getStatic !== false){
  //     const
  //   }
}

/**
 * 把el.attrsList更新el.attrs
 */
export function addAttr(
  el: ASTElement,
  name: string,
  value: any,
  range?: Range,
  dynamic?: boolean
) {
  const attrs = dynamic
    ? el.dynamicAttrs || (el.dynamicAttrs = [])
    : el.attrs || (el.attrs = []);

  attrs.push(rangeSetItem({ name, value, dynamic }, range));
  el.plain = false;
}

/**
 * 更新el.attrs開始及結束位置
 */
function rangeSetItem(item: any, range?: { start?: number; end?: number }) {
  if (range) {
    if (range.start != null) {
      item.start = range.start;
    }

    if (range.end != null) {
      item.end = range.end;
    }
  }

  return item; // { name:'id',value:'app'}
}
