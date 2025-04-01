import { Component } from "../../types/component.js";
import { resolveAsset } from "../../types/options.js";
import { VNodeData } from "../../types/vnode.js";
import config from "../config.js";
import { traverse } from "../observer/traverse.js";
import {
  isArray,
  isDef,
  isFunction,
  isObject,
  isPrimitive,
  isTrue,
} from "../util/index.js";
import { createComponent } from "./create-component.js";
import {
  normalizeChildren,
  simpleNormalizeChildren,
} from "./helpers/normalize-children.js";
import VNode, { createEmptyVNode } from "./vnode.js";

/**
 * 轉換單層陣列
 */
const SIMPLE_NORMALIZE = 1;
/**
 * 資料中可能包含數字或字串，通常發生在手寫的render
 */
const ALWAYS_NORMALIZE = 2;

/**
 * @param context vm
 * @param tag html tag
 * @param data //event attr || vNode
 * @param children
 * @param normalizationType
 * @param alwaysNormalize
 */
export function createElement(
  context: Component,
  tag: any,
  data: any,
  children: any,
  normalizationType: any,
  alwaysNormalize: boolean
): VNode | Array<VNode> {
  if (isArray(data) || isPrimitive(data)) {
    normalizationType = children;
    children = data;
    data = undefined;
  }

  if (isTrue(alwaysNormalize)) {
    normalizationType = ALWAYS_NORMALIZE;
  }
  return _createElement(context, tag, data, children, normalizationType);
}

export function _createElement(
  context: Component,
  tag?: string | Component | Function | Object,
  data?: VNodeData,
  children?: any,
  normalizationType?: number
): VNode | Array<VNode> {
  if (isDef(data) && isDef(data.is)) {
    tag = data.is;
  }
  if (!tag) return createEmptyVNode();

  if (normalizationType === ALWAYS_NORMALIZE) {
    children = normalizeChildren(children);
  } else if (normalizationType === SIMPLE_NORMALIZE) {
    children = simpleNormalizeChildren(children);
  }

  let vnode: any, ns;
  if (typeof tag === "string") {
    let Ctor;
    ns = (context.$vnode && context.$vnode.ns) || config.getTagNamespace(tag);

    if (config.isReservedTag(tag)) {
      vnode = new VNode(
        config.parsePlatformTagName(tag),
        data,
        children,
        undefined,
        undefined,
        context
      );
    } else if (
      (!data || !data.pre) &&
      isDef((Ctor = resolveAsset(context.$options, "components", tag)))
    ) {
      // component 處理
      vnode = createComponent(Ctor, data, context, children, tag);
    } else {
      vnode = new VNode(tag, data, children, undefined, undefined, context);
    }
  }

  if (isArray(vnode)) {
    return vnode;
  } else if (isDef(vnode)) {
    if (isDef(data)) {
      registerDeepBindings(data);
    }
    return vnode;
  }
  return createEmptyVNode();
}

/**
 * :class={XX:true}
 * :style={XX:true}
 */
function registerDeepBindings(data: any) {
  if (isObject(data.style)) {
    traverse(data.style);
  }
  if (isObject(data.class)) {
    traverse(data.class);
  }
}
