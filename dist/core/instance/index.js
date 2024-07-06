//@ts-nocheck
import { initMixin } from "./init.js";
function Vue(options) {
    this._init(options);
    console.log('test');
}
initMixin(Vue);
const app = new Vue({});
export default Vue;
