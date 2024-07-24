import { EffectScope } from "../../v3/reactivity/effectScope.js";
import { mergeOptions } from "../util/options.js";

let uid = 0;

// function test<T>(fn: (str: string) => T): (sr: string) => T {
//   return  ()=> {
//     return fn("test");
//   };
// }

export function initMixin(Vue: any) {
  Vue.prototype._init = function (options: any) {
    // console.log("options", options);
    const vm: any = this;

    vm._uid = uid++;
    vm._isVue = true;
    vm._scope = new EffectScope();
    vm._scope.parent = undefined;

    if (options && options._isComponent) {
      //暫時不會走到這裡
    } else {
      console.log("constructor", vm.constructor);
      vm.$options = mergeOptions(
        // resolveConstructorOptions(vm.constructor as any),
        {},
        options,
        vm
      );
      // vm.$options = {};
    }

    // console.log(vm);
  };
}

export function resolveConstructorOptions(Ctor: any) {
  let options = Ctor.options;

  return options;
}
