import {
  isArray,
  isDef,
  isFalse,
  isPrimitive,
  isUndef,
} from "../../util/index.js";
import VNode, { createTextVNode } from "../vnode.js";

export function simpleNormalizeChildren(children: any) {
  for (let i = 0; i < children.length; i++) {
    if (isArray(children[i])) {
      return Array.prototype.concat([], children);
    }
  }
  return children;
}

/**
 * 判斷是否為文字節點
 */
function isTextNode(node: any): boolean {
  return isDef(node) && isDef(node.text) && isFalse(node.isComment);
}

export function normalizeChildren(children: any): Array<VNode> | undefined {
  if (isPrimitive(children)) {
    return [createTextVNode(children)];
  } else if (isArray(children)) {
    return normalizeArrayChildren(children);
  }
  return undefined;
}

function normalizeArrayChildren(
  children: any,
  nestedIndex?: string
): Array<VNode> {
  const res: VNode[] = [];

  let /**
     * children[i]
     */
    c,
    lastIndex,
    last;

  for (let i = 0; i < children.length; i++) {
    c = children[i];

    //c是否為空或布林直
    if (isUndef(c) || typeof c === "boolean") continue;

    lastIndex = res.length - 1;
    last = res[lastIndex];

    if (isArray(c)) {
      // 陣列
      if (c.length > 0) {
        // c = normalizeArrayChildren(c, `${nestedIndex || ""}_${i}`);

        if (isTextNode(c[0]) && isTextNode(last)) {
          //   console.log("c", c);
        }
        res.push(...c);
      }
    } else if (isPrimitive(c)) {
    } else {
      if (isTextNode(c) && isTextNode(last)) {
      }
      res.push(c);
    }
  }

  return res;
}
