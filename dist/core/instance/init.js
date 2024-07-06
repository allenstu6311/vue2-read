import { EffectScope } from "../../v3/reactivity/effectScope.js";
let uid = 0;
export function initMixin(Vue) {
    Vue.prototype._init = function (options) {
        const vm = this;
        vm._uid = uid++;
        vm._isVue = true;
        vm._scope = new EffectScope();
        console.log(vm);
    };
}
