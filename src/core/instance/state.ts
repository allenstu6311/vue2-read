// @ts-nocheck
import { Component } from "../../types/component.js";
import { popTarget, pushTarget } from "../observer/dep.js";
import { observe, set } from "../observer/index.js";
import {
  hasOwn,
  isArray,
  isFunction,
  isPlainObject,
  noop,
} from "../shared/util.js";
import { isResvered } from "../util/lang.js";
import { bind } from "../shared/util.js";
import Watcher from "../observer/watcher.js";

/**
 * 共享屬性描述
 */
const sharedPropertyDefinition = {
  enumerable: true, // 是否可枚舉
  configurable: true, // 是否可刪除或修改
  get: noop,
  set: noop,
};

/**
 * 讓使用者可以使用this得到目標
 * @param target vm
 * @param sourceKey
 * @param key data:{test:1}
 */
export function proxy(target: Object, sourceKey: string, key: string) {
  sharedPropertyDefinition.get = function proxyGetter() {
    return this[sourceKey][key];
  };
  sharedPropertyDefinition.set = function proxySetter(val) {
    this[sourceKey][key] = val;
  };
  // 讓vue去監聽資料
  Object.defineProperty(target, key, sharedPropertyDefinition);
}

export function initState(vm: Component) {
  const opts = vm.$options;

  if (opts.methods) iniMethods(vm, opts.methods);
  if (opts.data) {
    initData(vm);
  }
  if (opts.computed) initComputed(vm, opts.computed);
  if (opts.watch) {
    initWatch(vm, opts.watch);
  }
}

function iniMethods(vm: Component, methods: Object) {
  const props = vm.$options.props;
  for (const key in methods) {
    vm[key] =
      typeof methods[key] !== "function" ? noop : bind(methods[key], vm);
  }
}

function initData(vm: Component) {
  let data: any = vm.$options.data;
  data = vm._data = isFunction(data) ? getData(data, vm) : data || {};

  if (!isPlainObject(data)) data = {};
  const keys = Object.keys(data);
  const props = vm.$options.props;
  const methods = vm.$options.methods;
  let i = keys.length;

  while (i--) {
    const key = keys[i];
    if (props && hasOwn(props, key)) {
    } else if (!isResvered(key)) {
      proxy(vm, `_data`, key);
    }
  }

  const ob = observe(data);

  ob && ob.vmCount++;
}

export function getData(data: Function, vm: Component) {
  pushTarget();
  try {
    return data.call(vm, vm);
  } catch (e: any) {
    return {};
  } finally {
    popTarget();
  }
}

/**
 * computed設定lazy
 */
const computedWatcherOptions = { lazy: true };

function initComputed(vm: Component, computed: Object) {
  const watchers = (vm._computedWatchers = Object.create(null));

  for (const key in computed) {
    const userDef = computed[key]; // value
    const getter = isFunction(userDef) ? userDef : userDef.get;

    //建立計算屬性內部觀察程序
    watchers[key] = new Watcher(
      vm,
      getter || noop,
      noop,
      computedWatcherOptions
    );

    // 檢查vm是否有computed key
    if (!(key in vm)) {
      //讓this能夠直接取的computed的值
      defineComputed(vm, key, userDef);
    }
  }
}

/**
 * 聲明computed
 */
export function defineComputed(
  target: any, //vm
  key: string,
  userDef: Record<string, any> | (() => any)
) {
  if (isFunction(userDef)) {
    sharedPropertyDefinition.get = createGetterInvoker(userDef);
  }
  Object.defineProperty(target, key, sharedPropertyDefinition);
}

/**
 * @param fn computed方法(userDef)
 */
function createGetterInvoker(fn: Function) {
  return function computerGetter() {
    return fn.call(this, this);
  };
}

function initWatch(vm: Component, watch: Object) {
  for (const key in watch) {
    const handler = watch[key];

    if (isArray(handler)) {
    } else {
      createWatcher(vm, key, handler);
    }
  }
}

function createWatcher(
  vm: Component,
  expOrFn: string | (() => any), //key
  handler: any, //fn
  options?: Object
) {
  if (isPlainObject(handler)) {
    options = handler;
    handler = handler.handler;
  }

  if (typeof handler === "string") {
    handler = vm[handler];
  }
  return vm.$watch(expOrFn, handler, options);
}

export function stateMixin(Vue: typeof Component) {
  const dataDef: any = {};
  dataDef.get = function () {
    return this._data;
  };

  const propsDef: any = {};
  propsDef.get = function () {
    return this._props;
  };

  Object.defineProperty(Vue.prototype, "$data", dataDef);
  Object.defineProperty(Vue.prototype, "$props", propsDef);

  Vue.prototype.$set = set;
  Vue.prototype.$watch = function (
    expOrFn: string | (() => any), //key
    cb: any, // handler fn
    options?: Record<string, any>
  ): Function {
    const vm: Component = this;
    if (isPlainObject(cb)) {
    }
    options = options || {};
    options.user = true;
    const watcher = new Watcher(vm, expOrFn, cb, options);

    if (options.immediate) {
    }

    return function unwatchFn() {
      watcher.teardown();
    };
  };
}
