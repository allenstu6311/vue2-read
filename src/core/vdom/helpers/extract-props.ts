import { Component } from "../../../types/component.js";
import { VNodeData } from "../../../types/vnode.js";
import { isDef, isUndef } from "../../shared/util.js";

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
  }

  return res;
}
