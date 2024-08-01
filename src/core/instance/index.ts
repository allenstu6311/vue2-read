// @ts-nocheck
import { initMixin } from "./init.js";
import { stateMixin } from "./state.js";
import { GlobalAPI } from "../../types/global-api.js";
import { initGlobalAPI } from "../global-api/index.js";
import { Component } from "../../types/component.js";
import { initMount } from "../../platforms/web/runtime-with-compiler.js";

//test

import { cached } from "../shared/util.js";
import { compileToFunctions } from "../../platforms/web/compiler/index.js";
import { query } from "../../platforms/web/util/index.js";

function Vue(options: any) {
  this._init(options);
}

initMixin(Vue);
stateMixin(Vue);
initGlobalAPI(Vue);
initMount(Vue);

export default Vue as unknown as GlobalAPI;

const app = new Vue({
  props: {
    "test-test": {
      type: String,
      default: "",
    },
  },
  directives: {
    "todo-focus": function (el, binding) {
      if (binding.value) {
        el.focus();
      }
    },
  },
  data() {
    return {
      test: 1,
    };
  },
  methods: {
    test() {},
  },
  watch: {
    test() {},
  },
  mounted() {
    // console.log(this);
  },
}).$mount("#app");
