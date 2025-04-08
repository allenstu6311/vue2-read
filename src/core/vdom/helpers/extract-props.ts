import { Component } from "../../../types/component.js";
import { VNodeData } from "../../../types/vnode.js";
import { hasOwn, hyphenate, isDef, isUndef } from "../../shared/util.js";

export function extractPropsFromVNodeData(
  data: VNodeData,
  Ctor: typeof Component,
  tag?: string
): object | undefined {
  const propOptions = Ctor.options.props;
  if (isUndef(propOptions)) {
    return;
  }

  const res = {};
  const { attrs, props } = data;

  if (isDef(attrs) || isDef(props)) {
    for (const key in propOptions) {
      const altKey = hyphenate(key);
      checkProp(res, props, key, altKey, true) ||
        checkProp(res, attrs, key, altKey, false);
    }
  }

  return res;
}

function checkProp(
  res: Record<string, unknown>,
  hash: Record<string, unknown> | undefined,
  key: string,
  altKey: string,
  preserve: boolean
): boolean {
  if (isDef(hash)) {
    if (hasOwn(hash, key)) {
      res[key] = hash[key];
      if (!preserve) {
        delete hash[key];
      }
      return true;
    } else if (hasOwn(hash, altKey)) {
      res[key] = hash[altKey];
      if (!preserve) {
        delete hash[altKey];
      }
      return true;
    }
  }
  return false;
}
