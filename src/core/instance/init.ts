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
      initInternalComponent(vm, options as any);
    } else {
      //合併options中所有欄位(data,computed,watch....)
      vm.$options = mergeOptions(
        resolveConstructorOptions(vm.constructor as any),
        options,
        vm
      );
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

export function initInternalComponent(
  vm: Component,
  options: InternalComponentOptions
) {
  const opts = (vm.$options = Object.create((vm.constructor as any).options));
  // doing this because it's faster than dynamic enumeration.
  const parentVnode = options._parentVnode;
  opts.parent = options.parent;
  opts._parentVnode = parentVnode;

  const vnodeComponentOptions = parentVnode.componentOptions!;
  opts.propsData = vnodeComponentOptions.propsData;
  opts._parentListeners = vnodeComponentOptions.listeners; // emit事件...
  opts._renderChildren = vnodeComponentOptions.children;
  opts._componentTag = vnodeComponentOptions.tag;

  if (options.render) {
    opts.render = options.render;
    opts.staticRenderFns = options.staticRenderFns;
  }
}
