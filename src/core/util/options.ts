import { isFunction, isArray, isPlainObject } from "../shared/util.js";
import { camelize, hasOwn } from "../shared/util.js";
import config from "../config.js";
import { hasSymbol } from "./env.js";
import { set } from "../observer/index.js";

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
      console.log("normalizeDirectives", def);
      if (isFunction(def)) {
        dirs[key] = { bind: def, update: def };
      }
    }
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
) {
  if (isFunction(child)) {
    // @ts-expect-error
    child = child.options;
  }
  normalizeProps(child, vm);
  //normalizeInject(child, vm)
  normalizeDirectives(child); //等可以綁釘模板在測試

  const options: any = {} as any;
  let key;

  for (key in child) {
    if (hasOwn(parent, key)) {
    }
    // console.log("key", key);
  }

  function mergeField(key: any) {
    // const state = sta;
  }
}
