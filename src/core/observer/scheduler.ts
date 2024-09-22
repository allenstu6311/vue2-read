import { Component } from "../../types/component.js";
import { callHook } from "../instance/lifecycle.js";
import { nextTick } from "../util/next-tick.js";
import Dep, { cleanupDeps } from "./dep.js";
import Watcher from "./watcher.js";

const queue: Array<Watcher> = [];
const activatedChildren: Array<Component> = [];
/**
 * 紀錄watcher id
 */
let has: { [key: number]: true | undefined | null } = {};
let flushing = false;
let waiting = false;
let index = 0;

/**
 * 重制調動狀態
 */
function resetSchedulerState() {
  index = queue.length = activatedChildren.length = 0;
  has = {};
  waiting = flushing = false;
}

/**
 * 記錄調度隊列刷新時的時間戳，用於處理異步更新的邊緣情況，確保事件和更新的順序正確。
 * 只有在 Firefox <= 53 使用
 */
export let currentFlushTimestamp = 0;
// Async edge case fix requires storing an event listener's attach timestamp.
let getNow: () => number = Date.now;

const sortCompareFn = (a: Watcher, b: Watcher): number => {
  if (a.post) {
    if (b.post) return 1;
  } else if (b.post) {
    return -1;
  }
  return a.id - b.id;
};

/**
 * 負責執行自定義任務隊列中的所有監視者
 */
function flushSchedulerQueue() {
  currentFlushTimestamp = getNow();
  flushing = true;
  let watcher, id;

  /**
   * 刷新對列排序
   * 1.確保元件要從父層更新到子層
   * 2.確保觀察程式在渲染程式之前執行
   * 3.如果元件在父元件的觀察程式運作期間被銷毀，可以跳過它的觀察者
   */
  queue.sort(sortCompareFn);

  for (index = 0; index < queue.length; index++) {
    watcher = queue[index];
    if (watcher.before) {
      watcher.before();
    }
    id = watcher.id;
    has[id] = null;
    
    /**
     * 關鍵更新畫面方法
     */
    watcher.run();
  }  
  // 暫時缺少activited生命期

  resetSchedulerState();
  callUpdatedHooks();
  cleanupDeps();
}

function callUpdatedHooks() {
  let i = queue.length;
  while (i--) {
    const watcher = queue[i];
    const vm = watcher.vm;
    if (vm && vm._watcher && vm._isMounted && !vm._isDestroyed) {
      callHook(vm, "updated");
    }
  }
}

/**
 * 將監聽事件進行對列排序
 */
export function queueWatcher(watcher: Watcher) {
  const id = watcher.id;

  if (has[id] != null) return;
  if (watcher === Dep.target && watcher.noRecurse) return;
  // debugger
  has[id] = true;

  // 如果正在處理事件，就先加入對列
  if (!flushing) {
    queue.push(watcher);
  }

  // 刷新排隊
  if (!waiting) {
    waiting = true;
    nextTick(flushSchedulerQueue);
  }
}
