import Dep, { DepTarget } from "./dep";
import type { SimpleSet } from "../util";
import { DebuggerEvent, DebuggerOptions } from "../../v3";
import {
  activeEffectScope,
  recordEffectScope,
} from "../../v3/reactivity/effectScope";

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
  expression: string; //調適資料變更的訊息
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
  before?: Function; //在watch callback函數觸發回調之前執行的函數
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
    this.id = ++uid;
  }
  addDep() {}
  update() {}
}
