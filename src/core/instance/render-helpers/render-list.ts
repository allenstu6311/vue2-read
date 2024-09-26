import { hasSymbol, isArray, isDef, isObject } from "../../util/index.js";
import VNode from "../../vdom/vnode.js";

/**
 * render v-for
 */
export function renderList(
  val: any,
  render: (val: any, keyOrIndex: string | number, index?: number) => VNode
): Array<VNode> | null {
  let ret: Array<VNode> | null = null,
    i,
    l,
    keys,
    key;

  if (isArray(val) || typeof val === "string") {
    ret = new Array(val.length);
    for (i = 0, l = val.length; i < l; i++) {
      ret[i] = render(val[i], i);
    }
  } else if (typeof val === "number") {
    ret = new Array(val);
    for (i = 0, l = val; i < l; i++) {
      console.log(i);
      ret[i] = render(i + 1, i);
    }
  } else if (isObject(val)) {
    keys = Object.keys(val);
    ret = new Array(keys.length);

    for (i = 0, l = keys.length; i < l; i++) {
      ret[i] = render(val[keys[i]], i);
    }
  }

  if (!isDef(ret)) {
    ret = [];
  }
  (ret as any)._isVList = true;
  return ret;
}
