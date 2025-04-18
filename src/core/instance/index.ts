// @ts-nocheck
import { initMixin } from "./init.js";
import { stateMixin } from "./state.js";
import { GlobalAPI } from "../../types/global-api.js";
import { initGlobalAPI } from "../global-api/index.js";
import { Component } from "../../types/component.js";
import { initMount } from "../../platforms/web/runtime-with-compiler.js";

//test

import { cached, noop } from "../shared/util.js";
import { compileToFunctions } from "../../platforms/web/compiler/index.js";
import { query } from "../../platforms/web/util/index.js";
import { lifecycleMixin, mountComponent } from "./lifecycle.js";
import { renderMixin } from "./render.js";
import { patch } from "../../platforms/web/runtime/patch.js";
import {
  getTagNamespace,
  isReservedTag,
} from "../../platforms/web/util/element.js";
import { eventsMixin } from "./events.js";

function Vue(options: any) {
  this._init(options);
}

// DIY
initGlobalAPI(Vue);

initMixin(Vue);
stateMixin(Vue);
eventsMixin(Vue);
lifecycleMixin(Vue);
renderMixin(Vue);

export const mount = (Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  return mountComponent(this, el, hydrating);
});

initMount(Vue);

Vue.config.isReservedTag = isReservedTag;
Vue.config.getTagNamespace = getTagNamespace;
Vue.prototype.__patch__ = patch;

window.Vue = Vue;
export default Vue as unknown as GlobalAPI;

// const app = new Vue({
//   props: {
//     "test-test": {
//       type: String,
//       default: "",
//     },
//   },
//   directives: {
//     "todo-focus": function (el, binding) {
//       if (binding.value) {
//         el.focus();
//       }
//     },
//   },
//   data() {
//     return {
//       test: 234,
//       test2: "test",
//     };
//   },
//   methods: {
//     test() {},
//   },
//   watch: {
//     test() {},
//   },
//   mounted() {
//     // console.log(this);
//   },
// }).$mount("#app");
