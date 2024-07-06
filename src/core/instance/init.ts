import { EffectScope } from "../../v3/reactivity/effectScope.js";
let uid = 0;

export function initMixin(Vue:any){
   
    Vue.prototype._init  = function(options:any){
        const vm:any = this;

        vm._uid = uid++;
        vm._isVue = true;
        vm._scope = new EffectScope();
        console.log(vm)
    }
}