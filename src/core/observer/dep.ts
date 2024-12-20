import { DebuggerOptions, DebuggerEventExtraInfo } from "../../v3/index.js";
import Watcher from "./watcher.js";

let uid = 0;
const pendingCleanupDeps: Dep[] = [];

/**
 * 清除不再需要的訂閱者
 */
export const cleanupDeps = () => {};
export interface DepTarget extends DebuggerOptions {
  id: number;
  addDep(dep: Dep): void;
  update(): void;
}

/**
 * 管理依賴關係和通知依賴變化
 */
export default class Dep {
  /**
   * 當前正在執行的watcher
   */
  static target?: DepTarget | null; 
  id: number;
  subs: Array<DepTarget | null>; //儲存所有watcher
  _pending = false; //用來標識當前是否有待清理的訂閱者

  constructor() {
    this.id = uid++;
    this.subs = [];
  }

  /**
   * 新增一個訂閱者
   * @param {Watcher} sub
   */
  addSub(sub: DepTarget) {
    this.subs.push(sub);
  }
  //移除一個訂閱者
  removeSub(sub: DepTarget) {
    //標記訂閱者為 null，延遲清理
    this.subs[this.subs.indexOf(sub)] = null;
    if (!this._pending) {
      this._pending = true;
      pendingCleanupDeps.push(this); //將目前 Dep 實例新增至待清理佇列中
    }
  }
  /**
   * 收集依赖关系
   */
  depend(info?: DebuggerEventExtraInfo) {
    //如果 Dep.target 存在，表示目前有一個依賴需要被收集，就將目前 Dep 實例加入 Dep.target 的依賴中
    if (Dep.target) {
      Dep.target.addDep(this); //收集依賴
      // if (info && Dep.target.onTrack) {
      //   //追蹤
      //   Dep.target.onTrack({
      //     effect: Dep.target,
      //     ...info,
      //   });
      // }
    }
  }
  /**
   * 通知所有訂閱者數據變化
   * @param info
   */
  notify(info?: DebuggerEventExtraInfo) {
    const subs = this.subs.filter((s) => s) as DepTarget[];
    subs.sort((a, b) => a.id - b.id); //确保通知顺序
    const l = subs.length;
    for (let i = 0; i < l; i++) {
      const sub = subs[i];
      if (info) {
        // sub.onTrigger &&
        //   sub.onTrigger({
        //     effect: subs[i],
        //     ...info,
        //   });
      }
      // 更新畫面
      sub.update();
    }
  }
}

Dep.target = null;
const targetStack: Array<DepTarget | null | undefined> = [];

/**
 * 加入當前watcher
 * 沒傳入target代表不須觸發響應式
 * target 通常是watcher
 */
export function pushTarget(target?: DepTarget | null | Watcher) {  
  targetStack.push(target);
  Dep.target = target;
}

/**
 * 移除當前watcher
 */
export function popTarget() {
  targetStack.pop();
  Dep.target = targetStack[targetStack.length - 1];
}
