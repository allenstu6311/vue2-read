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
   *
   */
  _vm?: boolean;
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
