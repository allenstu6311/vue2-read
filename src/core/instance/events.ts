import { Component } from "../../types/component.js";
import { isArray } from "../util/index.js";

/**
 *
 */
export function initEvents(vm: Component) {
  vm._events = Object.create(null);
  vm._hasHookEvent = false;

  const listeners = vm.$options._parentListeners;

  if (listeners) {
    updateComponentListeners(vm, listeners);
  }
}

export function updateComponentListeners(
  vm: Component,
  listeners: Object,
  oldListeners?: Object | null
) {}

export function eventsMixin(Vue: typeof Component) {
  const hookRE = /^hook:/;
  Vue.prototype.$on = function (
    event: string | Array<string>,
    fn: Function
  ): Component {
    const vm: Component = this;
    if (isArray(event)) {
    } else {
      (vm._events[event] || (vm._events[event] = [])).push(fn);
      if (hookRE.test(event)) {
        vm._hasHookEvent = true;
      }
    }
    return vm;
  };
}
