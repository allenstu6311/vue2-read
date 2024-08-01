import { ASTElement } from "../types/compiler.js";
import { parseFilters } from "./parser/filter-parser.js";

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
  modules?.map((item) => {
    console.log(item);
  });
  console.log("modules", modules);
  console.log("key", key);
  return modules ? (modules.map((m) => m[key]).filter((_) => _) as any) : [];
}

/**
 * 在ASTElement中获取并移除指定的属性
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
    getAndRemoveAttr(el, ":" + name) || getAndRemoveAttr(el, "v-bind" + name);

  if (dynamivValue != null) return parseFilters(dynamivValue);
  //   else if(getStatic !== false){
  //     const
  //   }
}
