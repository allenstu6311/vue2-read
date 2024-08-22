import { Component } from "../../types/component.js";
import { defineReactive } from "../observer/index.js";
import { emptyObject } from "../shared/util.js";
import { createElement } from "../vdom/create-element.js";

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
