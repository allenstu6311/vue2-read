import Dep, { DepTarget, pushTarget, popTarget } from "./dep.js";
import type { SimpleSet } from "../util/index.js";
import { DebuggerEvent, DebuggerOptions } from "../../v3/index.js";
import {
  activeEffectScope,
  recordEffectScope,
} from "../../v3/reactivity/effectScope.js";

import { isFunction, parsePath } from "../util/index.js";
import { queueWatcher } from "./scheduler.js";
/**
 * @internal
 */
export interface WatcherOptions extends DebuggerOptions {
  deep?: boolean;
  user?: boolean;
  lazy?: boolean;
  sync?: boolean;
  before?: Function;
}

let uid = 0;
/**
 * A watcher parses an expression, collects dependencies,
 * and fires callback when the expression value changes.
 * This is used for both the $watch() api and directives.
 * @internal
 */
export default class Watcher implements DepTarget {
  vm?: any; // Vue實體
  expression: string; //觀察表達式的字串表示形式(watche中可能會有多層物件)
  cb: Function; //數據變化時調用的callback
  id: number;
  deep: boolean; //是否深度觀察
  user: boolean; //判斷是否為用戶自行使用$watch製作的響應式數據，這樣能夠更好的提示錯誤訊息
  lazy: boolean; //避免不必要的計算，提高性能。只有當計算屬性被首次訪問或依賴的數據變更時，才會進行計算(computed用)
  sync: boolean; //觸發watch callback函數同步執行
  dirty: boolean; //通常與lazy搭配使用，通知資料更新
  active: boolean; //判斷實體是否處於激活狀態
  deps: Array<Dep>; //儲存所有被watch中的資料
  newDeps: Array<Dep>;
  depIds: SimpleSet;
  newDepIds: SimpleSet;
  /**
   * 生命週期beforeUpdate
   */
  before?: Function;
  onStop?: Function; //watch被停止時調用(destory時觸發)
  noRecurse?: boolean;
  getter: Function;
  value: any;
  post: boolean;

  onTrack?: ((event: DebuggerEvent) => void) | undefined; //追蹤
  onTrigger?: ((event: DebuggerEvent) => void) | undefined; //觸發

  constructor(
    vm: any | null,
    expOrFn: string | (() => any),
    cb: Function,
    options?: WatcherOptions | null,
    isRenderWatcher?: boolean
  ) {
    //紀錄副作用
    recordEffectScope(
      this,
      activeEffectScope && !activeEffectScope._vm
        ? activeEffectScope
        : vm
        ? vm._scope
        : undefined
    );
    //如果 vm 存在（即 this.vm 被成功賦值）且 isRenderWatcher 為 true，則將目前 Watcher 實例賦值給 vm._watcher。
    if ((this.vm = vm) && isRenderWatcher) {
      vm._watcher = this;
    }
    if (options) {
      this.deep = !!options.deep;
      this.user = !!options.user;
      this.lazy = !!options.lazy;
      this.sync = !!options.sync;
      this.before = options.before;
      this.onTrack = options.onTrack;
      this.onTrigger = options.onTrigger;
    } else {
      this.deep = this.user = this.lazy = this.sync = false;
    }
    this.cb = cb;
    this.id = ++uid;
    this.active = true;
    this.post = false;
    this.dirty = this.lazy; // for lazy watchers
    this.deps = [];
    this.newDeps = [];
    this.depIds = new Set();
    this.newDepIds = new Set();
    this.expression = expOrFn.toString();

    if (isFunction(expOrFn)) {
      this.getter = expOrFn; //渲染函數方法(vm._update(vm._render(), hydrating);)
    } else {
      this.getter = parsePath(expOrFn);
    }
    this.value = this.lazy ? undefined : this.get();
  }
  /**
   * 評估 getter，並重新收集依賴項。
   */
  get() {
    pushTarget(this);
    let value;
    const vm = this.vm;

    try {
      //.call(第一個是執行環境，第二個是funcion的參數)
      value = this.getter.call(vm, vm);

      // console.log("value", value);
    } catch (e) {
      if (this.user) {
      } else throw e;
    } finally {
      // 如果是深度監聽，則遞歸地觸摸每個屬性，觸發它們的 getter
      // if (this.deep) {
      //   traverse(value)
      // }
      popTarget();
      this.cleanupDeps();
    }
    return value;
  }
  /**
   * 加入依賴
   */
  addDep(dep: Dep) {
    const id = dep.id;
    if (!this.newDepIds.has(id)) {
      this.newDepIds.add(id);
      this.newDeps.push(dep);
      if (!this.depIds.has(id)) {
        dep.addSub(this);
      }
    }
  }
  /**
   * 清理依賴項目的蒐集
   */
  cleanupDeps() {}
  /**
   * 同步畫面資料(初始化不會觸發)
   */
  update() {
    if (this.lazy) {
      this.dirty = true;
    } else if (this.sync) {
      this.run();
    } else {
      queueWatcher(this);
    }
  }
  /**
   * 同步資料與畫面
   */
  run() {
    this.get();
  }
  evaluate() {}
  depend() {}
  teardown() {}
}
