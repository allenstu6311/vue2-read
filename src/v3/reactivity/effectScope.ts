export class EffectScope {
  /**
   * @internal
   * 判斷實體是否活躍，如果是true則可進行副作用，反之則不能運行
   */
  active = true;
  /**
   * @internal
   */
  effects: any[] = [];
  /**
   * @internal
   */
  cleanups: (() => void)[] = []
}
