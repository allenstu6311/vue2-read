import { EffectScope } from "../../v3/reactivity/effectScope.js";
import { mergeOptions } from "../util/options.js";
import type { Component } from "../../types/component.js";

let uid = 0;

export function initMixin(Vue: any) {
  Vue.prototype._init = function (options: any) {
    // console.log("options", options);
    const vm: Component = this;

    vm._uid = uid++;
    vm._isVue = true;
    vm._scope = new EffectScope();
    vm._scope.parent = undefined;

    if (options && options._isComponent) {
      //暫時不會走到這裡
    } else {
      //合併options中所有欄位(data,computed,watch....)
      vm.$options = mergeOptions(
        resolveConstructorOptions(vm.constructor as any),
        options,
        vm
      );
    }

    console.log(vm);
  };
}

export function resolveConstructorOptions(Ctor: any) {
  let options = Ctor.options;

  return options;
}
