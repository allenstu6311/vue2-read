//@ts-nocheck
import { EffectScope } from "../../v3/reactivity/effectScope.js";
import { mergeOptions } from "../util/options.js";
import type { Component } from "../../types/component.js";
import { callHook, initLifecycle } from "./lifecycle.js";
import { initEvents } from "./events.js";
import { initRender } from "./render.js";
import {
  getTagNamespace,
  isReservedTag,
} from "../../platforms/web/util/element.js";
import { initState } from "./state.js";
import VNode from "../vdom/vnode.js";

let uid = 0;

export function initMixin(Vue: any) {
  Vue.prototype._init = function (options: any) {

    const vm: Component = this;
    vm._uid = uid++;
    vm._isVue = true;
    vm._scope = new EffectScope();
    vm._scope.parent = undefined;

    if (options && options._isComponent) {
      //使用component的時候才會觸發暫時不處理
    } else {
      //合併options中所有欄位(data,computed,watch....)
      vm.$options = mergeOptions(
        resolveConstructorOptions(vm.constructor as any),
        options,
        vm
      );
      // console.log('vm.$options',vm.$options);
    }

    vm._renderProxy = vm; // 之後考慮用proxy
    vm._self = vm;

    initLifecycle(vm);
    initEvents(vm);
    initRender(vm);
    callHook(vm, "beforeCreate", undefined, false /* setContext */);
    initState(vm);
    callHook(vm, "created");
  };
}

export function resolveConstructorOptions(Ctor: Component) {
  let options = Ctor.options;

  return options;
}
