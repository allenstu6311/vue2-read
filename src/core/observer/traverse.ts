import { isArray, isObject } from "../util/index.js";
import { SimpleSet } from "../util/index.js";
import VNode from "../vdom/vnode.js";

const seenObjects = new Set();

export function traverse(val: any) {
  _traverse(val, seenObjects)
  seenObjects.clear()
  return val
}

function _traverse(val: any, seen: SimpleSet) {
  let i, keys;
  /**
   * 是否為陣列
   */
  const isA = isArray(val);

  if (
    (!isA && !isObject(val)) ||
    val.__v_skip ||
    Object.isFrozen(val) ||
    val instanceof VNode
  )
    return;

  if(val.__ob__){
    const depId = val.__ob__.dep.id;

    if(seen.has(depId)) return;
    seen.add(depId);
  }

  if (isA) {
    i = val.length;
    while (i--) _traverse(val[i], seen);

  } else {
    keys = Object.keys(val);
    i = keys.length;
    while (i--) _traverse(val[keys[i]], seen);
  }
}
