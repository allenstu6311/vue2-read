export class EffectScope {
    constructor() {
        /**
         * @internal
         * 判斷實體是否活躍，如果是true則可進行副作用，反之則不能運行
         */
        this.active = true;
        /**
         * @internal
         */
        this.effects = [];
        /**
         * @internal
         */
        this.cleanups = [];
    }
}
