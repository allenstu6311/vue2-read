import { Component } from "../../types/component.js";
import { set } from "../observer/index.js";

export function initState(vm: Component) {
  const opts = vm.$options;
}

export function stateMixin(Vue: any) {
  Vue.prototype.$set = set;
}
