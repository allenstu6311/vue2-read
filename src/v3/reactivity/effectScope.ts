import Watcher from "../../core/observer/watcher";

export let activeEffectScope: EffectScope | undefined;
export class EffectScope {
  /**
   * @internal
   * 判斷實體是否活躍，如果是true則可進行副作用，反之則不能運行
   */
  active = true;
  /**
   * @internal
   */
  effects: Watcher[] = [];
  /**
   * @internal
   */
  cleanups: (() => void)[] = [];
  /**
   * @internal
   */
  parent: EffectScope | undefined;
  /**
   * @internal
   */
  scopes: EffectScope[] | undefined;
  /**
   * 實體
   */
  _vm?: boolean;
  /**
   * 追蹤子作用域在其父作用域數組中的索引以優化刪除
   */
  private index: number | undefined;

  constructor(public datached = false) {
    this.parent = activeEffectScope;
    if (!datached && activeEffectScope) {
      //記錄該實體在父層的位置
      if (!activeEffectScope.scopes) {
        activeEffectScope.scopes = [];
      }
      activeEffectScope.scopes.push(this);
      this.index = activeEffectScope.scopes.length - 1;
    }
  }

  run<T>() {}
  on() {}
  off() {}
  stop(fromParent?: boolean) {}
}

/**
 * 紀錄一個副作用
 * @internal
 */
export function recordEffectScope(
  effect: Watcher,
  scope: EffectScope | undefined = activeEffectScope
) {
  if (scope && scope.active) {
    scope.effects.push(effect);
  }
}
