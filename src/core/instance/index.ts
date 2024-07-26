// @ts-nocheck
import { initMixin } from "./init.js";
import { stateMixin } from "./state.js";
import { GlobalAPI } from "../../types/global-api.js";

function Vue(options: any) {
  this._init(options);
}

initMixin(Vue);
stateMixin(Vue);

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
    return {};
  },
  methods: {},
  mounted() {
    // console.log(this);
  },
});
