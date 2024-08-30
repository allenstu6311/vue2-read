import { Component } from "../../types/component.js";
import {
  currentInstance,
  setCurrentInstance,
} from "../../v3/currentInstance.js";
import { defineReactive } from "../observer/index.js";
import { emptyObject, isArray } from "../shared/util.js";
import { createElement } from "../vdom/create-element.js";
import VNode, { createEmptyVNode } from "../vdom/vnode.js";

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
  Vue.prototype._render = function (): VNode {
    const vm: Component = this;
    const { render, _parentVnode } = vm.$options;

    vm.$vnode = _parentVnode!;

    const prevInst = currentInstance;
    const prevRenderInst = currentRenderingInstance;
    let vnode;

    setCurrentInstance(vm);
    currentRenderingInstance = vm;
    vnode = render.call(vm._renderProxy, vm.$createElement);

    currentRenderingInstance = prevRenderInst;
    setCurrentInstance(prevInst);

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
