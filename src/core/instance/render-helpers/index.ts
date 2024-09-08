import { toString } from "../../shared/util.js";
import { createTextVNode } from "../../vdom/vnode.js";

/**
 * 下載渲染助手
 */
export function installRenderHelpers(target:any){
    target._v = createTextVNode;
    target._s = toString;
}