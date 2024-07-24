import { set } from "../observer/index.js";

export function stateMixin(Vue: any) {
  Vue.prototype.$set = set;
}
