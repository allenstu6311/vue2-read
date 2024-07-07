import { DepTarget } from "./dep";

let uid = 0;
export default class Watcher implements DepTarget {
  vm?: any; // Vue實體
  expression: string; //調適資料變更的訊息
  cb: Function; //數據變化時調用的callback
  id: number;
  deep: boolean; //是否深度觀察
  user: boolean; //判斷是否為用戶自行使用$watch製作的響應式數據，這樣能夠更好的提示錯誤訊息

  constructor() {
    this.id = ++uid;
  }
  addDep() {}
  update() {}
}
