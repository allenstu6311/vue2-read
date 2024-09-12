import { LIFECYCLE_HOOKS } from "./shared/constants.js";
import { Component } from "../types/component.js";
import { no, noop, identity } from "./util/index.js";

export interface Config {
  //定義合併選項的策略函數。當你自定義 Vue 組件選項時，這些策略會告訴 Vue 如何合併這些選項。
  optionMergeStrategies: { [key: string]: Function };
  //設置為 true 時，Vue 不會在控制台中顯示警告訊息。
  silent: boolean;
  //設置為 false 時，禁用 Vue 啟動時的生產提示訊息。
  productionTip: boolean;
  devtools: boolean;
  errorHandler?: (err: Error, vm: Component | null, info: string) => void;
  warnHandler?: (msg: string, vm: Component | null, trace: string) => void;
  ignoredElements: Array<string | RegExp>;
  keyCodes: { [key: string]: number | Array<number> };

  // platform
  /**
   * 判斷是否為HTML標籤或SVG標籤
   */
  isReservedTag: (x: string) => boolean | undefined | any;
  isReservedAttr: (x: string) => true | undefined;
  parsePlatformTagName: (x: string) => string;
  isUnknownElement: (x: string) => boolean;
  getTagNamespace: (x: string) => string | undefined;
  mustUseProp: (tag: string, type?: string | null, name?: string) => boolean;

  // private
  async: boolean;

  // legacy
  _lifecycleHooks: Array<string>;
}

export default {
  /**
   * Option merge strategies (used in core/util/options)
   */
  // $flow-disable-line
  optionMergeStrategies: Object.create(null),

  /**
   * Whether to suppress warnings.
   */
  silent: false,

  /**
   * Show production mode tip message on boot?
   */
  productionTip: true,

  /**
   * Whether to enable devtools
   */
  devtools: true,

  /**
   * Whether to record perf
   */
  performance: false,

  /**
   * Error handler for watcher errors
   */
  errorHandler: null,

  /**
   * Warn handler for watcher warns
   */
  warnHandler: null,

  /**
   * Ignore certain custom elements
   */
  ignoredElements: [],

  /**
   * Custom user key aliases for v-on
   */
  // $flow-disable-line
  keyCodes: Object.create(null),

  /**
   * Check if a tag is reserved so that it cannot be registered as a
   * component. This is platform-dependent and may be overwritten.
   */
  isReservedTag: no,

  /**
   * Check if an attribute is reserved so that it cannot be used as a component
   * prop. This is platform-dependent and may be overwritten.
   */
  isReservedAttr: no,

  /**
   * Check if a tag is an unknown element.
   * Platform-dependent.
   */
  isUnknownElement: no,

  /**
   * Get the namespace of an element
   */
  getTagNamespace: noop,

  /**
   * Parse the real tag name for the specific platform.
   */
  parsePlatformTagName: identity,

  /**
   * Check if an attribute must be bound using property, e.g. value
   * Platform-dependent.
   */
  mustUseProp: no,

  /**
   * Perform updates asynchronously. Intended to be used by Vue Test Utils
   * This will significantly reduce performance if set to false.
   */
  async: true,

  /**
   * Exposed for legacy reasons
   */
  _lifecycleHooks: LIFECYCLE_HOOKS,
} as unknown as Config;
