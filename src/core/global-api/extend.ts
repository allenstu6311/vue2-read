import { Component } from "../../types/component.js";
import { GlobalAPI } from "../../types/global-api.js";
import { defineComputed, proxy } from "../instance/state.js";
import { ASSET_TYPES } from "../shared/constants.js";
import { extend } from "../shared/util.js";
import { mergeOptions } from "../util/options.js";
import { getComponentName } from "../vdom/create-component.js";

export function initExtend(Vue: GlobalAPI) {
  /**
   * 每個實例構造器（包括 Vue 本身）都有一個唯一的 cid。
   * 這讓我們可以為原型繼承創建封裝過的「子構造器」並加以快取。
   */
  Vue.cid = 0;
  let cid = 1;

  /**
   * Class inheritance
   */
  Vue.extend = function (extendOptions: any): typeof Component {
    console.log("this", this);

    extendOptions = extendOptions || {};
    const Super = this as any;
    const SuperId = Super.cid;
    const cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {});

    if (cachedCtors[SuperId]) {
      return cachedCtors[SuperId];
    }

    const name =
      getComponentName(extendOptions) || getComponentName(Super.options);

    const Sub = function VueComponent(this: any, options: any) {
      this._init(options);
    } as unknown as typeof Component;

    Sub.prototype = Object.create(Super.prototype);
    Sub.prototype.constructor = Sub;
    Sub.cid = cid++;
    Sub.options = mergeOptions(Super.options, extendOptions);
    Sub["super"] = Super;

    // For props and computed properties, we define the proxy getters on
    // the Vue instances at extension time, on the extended prototype. This
    // avoids Object.defineProperty calls for each instance created.
    if (Sub.options.props) {
      initProps(Sub);
    }
    if (Sub.options.computed) {
      initComputed(Sub);
    }

    // allow further extension/mixin/plugin usage
    Sub.extend = Super.extend;
    Sub.mixin = Super.mixin;
    Sub.use = Super.use;

    // create asset registers, so extended classes
    // can have their private assets too.
    ASSET_TYPES.forEach(function (type) {
      Sub[type] = Super[type];
    });
    // enable recursive self-lookup
    if (name) {
      Sub.options.components[name] = Sub;
    }

    // keep a reference to the super options at extension time.
    // later at instantiation we can check if Super's options have
    // been updated.
    Sub.superOptions = Super.options;
    Sub.extendOptions = extendOptions;
    Sub.sealedOptions = extend({}, Sub.options);

    // cache constructor
    cachedCtors[SuperId] = Sub;
    return Sub;
  };
}

function initProps(Comp: typeof Component) {
  const props = Comp.options.props;
  for (const key in props) {
    proxy(Comp.prototype, `_props`, key);
  }
}

function initComputed(Comp: typeof Component) {
  const computed = Comp.options.computed;
  for (const key in computed) {
    defineComputed(Comp.prototype, key, computed[key]);
  }
}
