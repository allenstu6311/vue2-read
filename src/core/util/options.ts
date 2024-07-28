import { isFunction, isArray, isPlainObject, extend } from "../shared/util.js";
import { camelize, hasOwn } from "../shared/util.js";
import config from "../config.js";
import { hasSymbol, nativeWatch } from "./env.js";
import { set } from "../observer/index.js";
import { ComponentOptions } from "../../types/options.js";
import { Component } from "../../types/component.js";
import { ASSET_TYPES } from "../shared/constants.js";

const strats = config.optionMergeStrategies;

strats.el = strats.propsData = function (
  parent: any,
  child: any,
  vm: any,
  key: any
) {
  return defaultStrat(parent, child);
};

/**
 * 默認的合併策略函數
 */
const defaultStrat = function (parentVal: any, childVal: any): any {
  return childVal === undefined ? parentVal : childVal;
};



/**
 *
 */
function mergeData(
  to: Record<string | symbol, any>,
  from: Record<string | symbol, any> | null,
  recursive = true
): Record<PropertyKey, any> {
  if (!from) return to;
  let key, toVal, fromVal;

  const keys = hasSymbol
    ? (Reflect.ownKeys(from) as string[])
    : Object.keys(from);

  for (let i = 0; i < keys.length; i++) {
    key = keys[i];
    //如果該物件已被觀察到
    if (key === "__ob__") continue;
    toVal = to[key];
    fromVal = from[key];
    if (!recursive || !hasOwn(to, key)) {
      set(to, key, fromVal);
    } else if (
      toVal !== fromVal &&
      isPlainObject(toVal) &&
      isPlainObject(fromVal)
    ) {
      mergeData(toVal, fromVal);
    }
  }
  return to;
}

/**
 * 合併所有的data欄位
 */
function mergeDataOrFn(
  parentVal: any, //mixin
  childVal: any, //vm
  vm?: Component
): Function | null {
  if (!vm) {
    if (!childVal) return parentVal;
    if (!parentVal) return childVal;

    //如果同時有parentVal && childVal
    return function mergedDataFn(this: any) {
      return mergeData(
        isFunction(childVal) ? childVal.call(this, this) : childVal,
        isFunction(parentVal) ? parentVal.call(this, this) : parentVal
      )
    }
  } else {
    return function mergedInstanceDataFn() {
      const instanceData = isFunction(childVal) ? childVal.call(vm, vm) : childVal
      const defaultData = isFunction(parentVal) ? parentVal.call(vm, vm) : parentVal
      if (instanceData) {
        return mergeData(instanceData, defaultData);
      }
      return defaultData;
    }
  }
}

/**
 * 合併component, directive", filter
 */
function mergeAssets(
  parentVal: Object | null,
  childVal: Object | null,
  vm: Component | null,
  key: string
): Object {
  const res = Object.create(parentVal || null);
  if (childVal) {
    assertObjectType(key, childVal, vm);
    return extend(res, childVal);
  }
  return res
}

ASSET_TYPES.forEach(type => {
  strats[type + 's'] = mergeAssets
});

/**
 * merge watch
 */
strats.watch = function (
  parentVal: Record<string, any> | null,
  childVal: Record<string, any> | null,
  vm: Component | null,
  key: string
): Object | null {
  //@ts-expect-error work around
  if (parentVal === nativeWatch) parentVal = undefined;
  //@ts-expect-error work around
  if (childVal === nativeWatch) childVal = undefined;

  if (!childVal) return Object.create(parentVal || null);
  assertObjectType(key, childVal, vm)
  if (!parentVal) return childVal

  /**
   * 如果合併的資料中有watch同個資料要避免覆蓋，因為到時資料變更同樣要觸發兩邊德watch
   * {
   *    test:[test(),test()]
   *    test2:[test()]
   * }
   */
  const ret: Record<string, any> = {}
  extend(ret, parentVal);
  for (const key in childVal) {
    let parent = ret[key];
    const child = childVal[key]
    if (parent && !isArray(parent)) {
      parent[parent];
    }
    ret[key] = parent ? parent.concat(child) : isArray(child) ? child : [child]
  }
  return ret;
}

/**
 * data merge
 */
strats.data = function (
  parentVal: any,
  childVal: any,
  vm?: Component
): Function | null {
  if (!vm) {
    if (childVal && typeof childVal !== 'function') {
      return parentVal
    }
    return mergeDataOrFn(parentVal, childVal)

  }
  return mergeDataOrFn(parentVal, childVal, vm)
}

/**
 * other merge
 */
strats.props =
  strats.methods =
  strats.computed =
  function (
    parentVal: Object | null | any,
    childVal: Object | null,
    vm: Component | null,
    key: string
  ): Object | null {

    if (childVal) {
      assertObjectType(key, childVal, vm);
      if (!parentVal) return childVal;
    }
    const ret = Object.create(parentVal || null);
    extend(ret, parentVal);
    if (childVal) extend(ret, childVal);
    return ret
  }

/**
 * 確保所有 props 選項語法都標準化為物件格式
 */
function normalizeProps(options: Record<string, any>, vm?: any) {
  const props = options.props;
  if (!props) return;

  const res: Record<string, any> = {};
  let i, val, name;

  if (isArray(props)) {
    i = props.length;
    while (i--) {
      val = props[i];

      if (typeof val === "string") {
        name = camelize(val);
        res[name] = { type: null };
      }
    }
  } else if (isPlainObject(props)) {
    for (const key in props) {
      val = props[key];
      name = camelize(key);
      res[name] = isPlainObject(val) ? val : { type: val };
    }
  }
  options.props = res;
}

/**
 * 製做v-XXX (例:v-model)
 */
function normalizeDirectives(options: Record<string, any>) {
  const dirs = options.directives;
  // console.log("normalizeDirectives", dirs);
  if (dirs) {
    for (const key in dirs) {
      const def = dirs[key];
      // console.log("normalizeDirectives", def);
      if (isFunction(def)) {
        dirs[key] = { bind: def, update: def };
      }
    }
  }
}

/**
 * 檢查是否為物件並顯示更具體的錯誤訊息
 */
function assertObjectType(name: string, value: any, vm: Component | null) {
  if (!isPlainObject(value)) {
    console.warn(`Invalid value for option "${name}": expected an Object`)
  }
}

/**
 * 將兩個選項物件合併為一個新選項物件，
 * 用於實例化和繼承的核心實用程式
 */
export function mergeOptions(
  parent: Record<string, any>,
  child: Record<string, any>,
  vm: any
): ComponentOptions {
  if (isFunction(child)) {
    // @ts-expect-error
    child = child.options;
  }
  normalizeProps(child, vm);
  //normalizeInject(child, vm)
  normalizeDirectives(child); //等可以綁釘模板在測試

  const options: any = {} as any;
  let key;

  for (key in parent) {
    mergeField(key)
  }

  for (key in child) {
    if (!hasOwn(parent, key)) {
      mergeField(key)
    }
  }



  function mergeField(key: any) {
    const strat = strats[key] || defaultStrat
    // console.log('key',key)
    // console.log('child',child[key])

    options[key] = strat(parent[key], child[key], vm, key)
  }
  return options;
}
