import { TrackOpTypes, TriggerOpTypes } from "../../v3/index.js";
import {
  hasOwn,
  isArray,
  isValidArrayIndex,
  hasChanged,
  isPlainObject,
  noop,
} from "../shared/util.js";
import { def, hasProto } from "../util/index.js";
import VNode from "../vdom/vnode.js";
import Dep from "./dep.js";
import { arrayMethods } from "./array.js";

/**
 * array method
 */
const arrayKeys = Object.getOwnPropertyNames(arrayMethods);

//無初始值
const NO_INITIAL_VALUE = {};

/**
 * 某些情況可能需要重新觀察或計算
 */
export let shouldObserve: boolean = true;

export function toggleObserving(value: boolean) {
  shouldObserve = value;
}

// ssr mock dep
const mockDep = {
  notify: noop,
  depend: noop,
  addSub: noop,
  removeSub: noop,
} as Dep;

/**
 * __ob__屬性
 * getter/setter
 */
export class Observer {
  dep: Dep;
  vmCount: number;

  constructor(
    public value: any, // data()
    public shallow = false, //資料是否僅單層
    public mock = false
  ) {
    this.dep = mock ? mockDep : new Dep();
    this.vmCount = 0;
    def(value, "__ob__", this); //將data設定__ob__屬性
    if (isArray(value)) {
      if (!mock) {
        if (hasProto) {
          // 訪問陣列方法時，可觸發arrayMethods的響應式
          (value as any).__proto__ = arrayMethods;
        } else {
        }
      }

      if (!shallow) {
        this.observeArray(value);
      }
    } else {
      /**
       * 作用是將一個對象的所有屬性轉換為“響應式”屬性
       * 當這些屬性發生變化時，Vue 可以自動檢測到變化並
       * 更新相關的視圖
       */
      const keys = Object.keys(value);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        defineReactive(value, key, NO_INITIAL_VALUE, undefined, shallow, mock);
      }
    }
  }

  /**
   * 觸發陣列方法後判斷是否需要觀察者
   */
  observeArray(value: any) {
    for (let i = 0; i < value.length; i++) {
      observe(value[i], false, this.mock);
    }
  }
}

/**
 * 將普通對象設定為響應式，並給每個屬性設置getter跟setter
 */
export function observe(
  value: any | any,
  shallow: boolean,
  ssrMockReactivity?: boolean
): Observer | void {
  // 判斷屬性是否已被觀察
  if (value && hasOwn(value, "__ob__") && value.__ob__ instanceof Observer) {
    return value.__ob__;
  }
  // console.log("observe value", value);

  if (
    shouldObserve &&
    (isArray(value) || isPlainObject(value)) && //是陣列或物件
    !value._v_skip && // 被標記可跳過
    Object.isExtensible(value) && //必須是可擴展的
    !(value instanceof VNode) // 不能是VNode
  ) {
    return new Observer(value, shallow, ssrMockReactivity);
  }
}

/**
 * 響應式核心，負責通知修改
 */
export function defineReactive(
  obj: Object | any, //vm or data
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

  // 子層觀察者
  let childOb: any;
  if (shallow) {
    childOb = val && val.__ob__;
  } else {
    // console.log('val',val);
    childOb = observe(val, false, mock);
  }

  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter() {
      const value = getter ? getter.call(obj) : val;

      if (Dep.target) {
        dep.depend();
      }

      if (childOb) {
        childOb.dep.depend();
        if (isArray(value)) {
          dependArray(value);
        }
      }

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

/**
 * 一開始就直接蒐集所有依賴，因為無法在後續的getter蒐集
 */
function dependArray(value: Array<any>) {
  for (let e, i = 0; i < value.length; i++) {
    e = value[i];
    if (e && e.__ob__) {
      e.__ob__.dep.depend();
    }
    if (isArray(e)) {
      dependArray(e);
    }
  }
}
