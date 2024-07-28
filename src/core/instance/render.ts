import { Component } from "../../types/component.js";
import { createElement } from "../vdom/create-element.js";

export function initRender(vm: Component) {
    vm._vnode = null // 子樹的根
    vm._staticTrees = null // v-once 快取樹
    const options = vm.$options

    //暫時沒有
    // const parentVnode = (vm.$vnode = options._parentVnode!) // the placeholder node in parent tree
    // const renderContext = parentVnode && (parentVnode.context as Component)

    vm.$slots = {};
    vm.$scopedSlots = {};

    vm._c = (a, b, c, d) => createElement(vm, a, b, c, d, false);



    // console.log(vm._c)

}