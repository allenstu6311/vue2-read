// @ts-nocheck
import { initMixin } from "./init.js";
import { stateMixin } from "./state.js";

function Vue(options: any) {
  this._init(options);
}

initMixin(Vue);
stateMixin(Vue);

// class student {
//   static id: number;
//   name: string;
//   score: number;

//   constructor(name, score) {
//     // this.id = id;
//     this.name = name;
//     this.score = score;
//   }
// }
// student.id = 1;
// const allen = new student("allen", 70);

// console.log("student", student);
// console.log("allen", allen);

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

export default Vue;
