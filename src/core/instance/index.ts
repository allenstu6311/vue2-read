// @ts-nocheck
import { initMixin } from "./init.js";
import { stateMixin } from "./state.js";
import { GlobalAPI } from "../../types/global-api.js";
import { initGlobalAPI } from "../global-api/index.js";

function Vue(options: any) {
  this._init(options);
}

initMixin(Vue);
stateMixin(Vue);
initGlobalAPI(Vue)

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
      test:1
    };
  },
  methods: {
    test(){}
  },
  watch:{
    test(){}
  },
  mounted() {
    // console.log(this);
  },
});
