// @ts-nocheck
import { Component } from "../../types/component.js";
import { popTarget, pushTarget } from "../observer/dep.js";
import { observe, set } from "../observer/index.js";
import { hasOwn, isFunction, isPlainObject, noop } from "../shared/util.js";
import { isResvered } from "../util/lang.js";
import { bind } from "../shared/util.js";

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

  if(opts.methods) iniMethods(vm,opts.methods)
  if (opts.data) {
    initData(vm);
  }
}

function iniMethods(vm:Component,methods:Object){
  const props = vm.$options.props;
  for(const key in methods){
    vm[key] = typeof methods[key] !== 'function' ? noop : bind(methods[key],vm);
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
}
