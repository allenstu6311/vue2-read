import { TrackOpTypes, TriggerOpTypes } from "../../v3";
import {
  hasOwn,
  isArray,
  isValidArrayIndex,
  hasChanged,
} from "../shared/util.js";
import Dep from "./dep.js";

//無初始值
const NO_INITIAL_VALUE = {};

/**
 *
 */
export class Observer {
  //   dep: Dep;
  //   vmCount: number;
}

/**
 *
 */
export function observe(
  value: any | any,
  shallow: boolean,
  ssrMockReactivity?: boolean
): Observer | void {
  if (value && hasOwn(value, "__ob__") && value.__ob__ instanceof Observer) {
    return value.__ob__;
  }
}

/**
 *
 */
export function defineReactive(
  obj: Object | any,
  key: string,
  val?: any,
  customSetter?: Function | null,
  shallow?: boolean,
  mock?: boolean,
  observeEvenIfShallow = false
) {
  const dep = new Dep();
  //例: Object { value: 42, writable: true, enumerable: true, configurable: true }
  const property = Object.getOwnPropertyDescriptor(obj, key);
  if (property && property.configurable === false) return;

  const getter = property && property.get;
  const setter = property && property.set;

  //當對象本身沒有該屬性時，直接賦值即可
  if (
    ((!getter || setter) && val === NO_INITIAL_VALUE) ||
    arguments.length === 2
  ) {
    val = obj[key];
  }

  //   let childOb = shallow ? val && val.__ob__ : observe(val, false, mock);
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter() {
      const value = getter ? getter.call(obj) : val;
      if (Dep.target) {
        dep.depend({
          target: obj,
          type: TrackOpTypes.GET,
          key,
        });
      } else {
        dep.depend();
      }

      //   if(childOb){}
      return value;
    },
    set: function reactiveSetter(newVal) {
      const value = getter ? getter.call(obj) : val;
      if (!hasChanged(val, newVal)) return;
      if (customSetter) customSetter();
      if (setter) setter.call(obj, newVal);
      else if (getter) return;
      else val = newVal;

      dep.notify({
        type: TriggerOpTypes.SET,
        target: obj,
        key,
        newValue: newVal,
        oldValue: value,
      });
    },
  });
  return dep;
}

/**
 * 函數重載簽名
 * Vue.set
 */
export function set<T>(array: T[], key: number, value: T): T;
export function set<T>(object: object, key: string | number, value: T): T;
export function set(
  target: any[] | Record<string, any> | any,
  key: any, //索引
  val: any
): any {
  const ob = (target as any).__ob__;
  if (isArray(target) && isValidArrayIndex(key)) {
    target.length = Math.max(target.length, key);
    target.splice(key, 1, val);

    //在SSR的環境中不需進行數據劫持
    // if (ob && !ob.shallow && ob.mock) {
    //   observe(val, false, true);
    // }
    return val;
  }
  //檢查key是否有在物件中，並且檢查是否為原型的屬性
  if (key in target && !(key in Object.prototype)) {
    target[key] = val;
    return val;
  }

  //如果是vue實例對象不允許添加屬性
  if ((target as any).isVue || (ob && ob.vmCount)) {
    console.warn("不允許再Vue實體添加屬性");
    return val;
  }

  //target並非響應式的對象，直接返回(更新資料但不更新畫面的狀況)
  if (!ob) {
    target[key] = val;
    return val;
  }

  defineReactive(ob.value, key, val, undefined, ob.shallow, ob.mock);
  ob.dep.notify({
    type: TriggerOpTypes.ADD,
    target: target,
    key,
    newValue: val,
    oldValue: undefined,
  });
  return val;
}
