import { toString } from "../../shared/util.js";
import { createTextVNode } from "../../vdom/vnode.js";
import { renderList } from "./render-list.js";

/**
 * 下載渲染助手
 */
export function installRenderHelpers(target: any) {
  // 創建文字結點
  target._v = createTextVNode;
  // 渲染{{}}內部文字
  target._s = toString;
  // v-for
  target._l = renderList;
}
