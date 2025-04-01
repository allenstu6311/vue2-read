import { Component } from "../../types/component.js";
import { ComponentOptions } from "../../types/options.js";
import { VNodeData } from "../../types/vnode.js";
import { isDef, isObject, isTrue, isUndef } from "../shared/util.js";
import { extractPropsFromVNodeData } from "./helpers/extract-props.js";
import VNode from "./vnode.js";

export function createComponent(
  Ctor: typeof Component | Function | ComponentOptions | void,
  data: VNodeData | undefined,
  context: Component,
  children?: Array<VNode>,
  tag?: string
): VNode | Array<VNode> | void {
  if (isUndef(Ctor)) {
    return;
  }

  const baseCtor = context.$options._base;

  if (isObject(Ctor)) {
    Ctor = baseCtor.extend(Ctor as typeof Component);
  }

  if (typeof Ctor !== "function") return;
  // @ts-expect-error
  if (isUndef(Ctor.cid)) {
  }

  data = data || {};
  if (isDef(data.model)) {
    // @ts-expect-error
    transformModel(Ctor.options, data);
  }

  // extract props
  // @ts-expect-error
  const propsData = extractPropsFromVNodeData(data, Ctor, tag);

  // functional component
  // @ts-expect-error
  if (isTrue(Ctor.options.functional)) {
  }

  // extract listeners, since these needs to be treated as
  // child component listeners instead of DOM listeners
  const listeners = data.on;
  // replace with listeners with .native modifier
  // so it gets processed during parent component patch.
  data.on = data.nativeOn;

  // install component management hooks onto the placeholder node
  installComponentHooks(data);

  return null as any;
}

export function getComponentName(options: ComponentOptions) {
  return options.name || options.__name || options._componentTag;
}

// transform component v-model info (value and callback) into
// prop and event handler respectively.
function transformModel(options: any, data: any) {
  const prop = (options.model && options.model.prop) || "value";
  const event = (options.model && options.model.event) || "input";
  (data.attrs || (data.attrs = {}))[prop] = data.model.value;
  const on = data.on || (data.on = {});
  const existing = on[event];
  const callback = data.model.callback;

  if (isDef(existing)) {
  } else {
    on[event] = callback;
  }
}

function installComponentHooks(data: VNodeData) {
  // 看到這裡
}
