import { Component } from "../../types/component.js";
import {
  currentInstance,
  setCurrentInstance,
} from "../../v3/currentInstance.js";
import { defineReactive } from "../observer/index.js";
import { emptyObject, isArray } from "../shared/util.js";
import { nextTick } from "../util/next-tick.js";
import { createElement } from "../vdom/create-element.js";
import VNode, { createEmptyVNode } from "../vdom/vnode.js";
import { installRenderHelpers } from "./render-helpers/index.js";

/**
 * 初始化 _C
 */
export function initRender(vm: Component) {
  vm._vnode = null; // 子樹的根
  vm._staticTrees = null; // v-once 快取樹
  const options = vm.$options;

  const parentVnode = (vm.$vnode = options._parentVnode!); // the placeholder node in parent tree
  const renderContext = parentVnode && (parentVnode.context as Component);

  vm.$slots = {};
  vm.$scopedSlots = {};

  vm._c = (a, b, c, d) => createElement(vm, a, b, c, d, false);

  // @ts-expect-error
  vm.$createElement = (a, b, c, d) => createElement(vm, a, b, c, d, true);
  const parentData = parentVnode && parentVnode.data;
  defineReactive(
    vm,
    "$attrs",
    (parentData && parentData.$attrs) || emptyObject,
    null,
    true
  );

  defineReactive(
    vm,
    "$listeners",
    options._parentListeners || emptyObject,
    null,
    true
  );
}

/**
 * 目前渲染實例
 */
export let currentRenderingInstance: Component | null = null;

export function renderMixin(Vue: typeof Component) {
  installRenderHelpers(Vue.prototype);

  Vue.prototype.$nextTick = function (fn: (...args: any[]) => any) {
    return nextTick(fn, this)
  }
  Vue.prototype._render = function (): VNode {
    const vm: Component = this;
    //render => with(this) return _c('div',{attrs:{"id":"app"}})...

    const { render, _parentVnode } = vm.$options;
    vm.$vnode = _parentVnode!;
    // console.log("render", render);

    const prevInst = currentInstance;
    const prevRenderInst = currentRenderingInstance;
    let vnode;
    try {
      setCurrentInstance(vm);
      currentRenderingInstance = vm;
      // console.log('vm.$createElement',vm.$createElement)
      // console.log('vm._renderProxy',vm._renderProxy);
      
      // 正式渲染vnode fn
      vnode = render.call(vm._renderProxy, vm.$createElement);
      // console.log("vnode", vnode);
    } catch (err) {
      console.log("renderMixin err", err);
    } finally {
      currentRenderingInstance = vm;
      setCurrentInstance(vm);
    }

    // 只允許單個節點
    if (isArray(vnode) && vnode.length === 1) {
      vnode = vnode[0];
    }

    if (!(vnode instanceof VNode)) {
      vnode = createEmptyVNode();
    }
    // set parent
    vnode.parent = _parentVnode;
    // console.log("_render vnode", vnode);
    return vnode;
  };
}
