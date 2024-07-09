//@ts-nocheck
import { initMixin } from "./init.js";

function Vue(options: any) {
  this._init(options);
  // console.log("test");
}

initMixin(Vue);

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

const app = new Vue({});

export default Vue;
