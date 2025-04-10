import { DebuggerEvent } from "./../v3/debug.js";
import VNode from "../core/vdom/vnode.js";
import { Component } from "./component.js";
import { camelize, capitalize, hasOwn } from "../core/shared/util.js";

export type InternalComponentOptions = {
  _isComponent: true;
  parent: Component;
  _parentVnode: VNode;
  render?: Function;
  staticRenderFns?: Array<Function>;
};

/**
 * @internal
 */
export type ComponentOptions = {
  // v3
  setup?: (props: Record<string, any>, ctx: any) => unknown;

  [key: string]: any;

  componentId?: string;

  // data
  data: object | Function | void;
  props?:
    | string[]
    | Record<string, Function | Array<Function> | null | PropOptions>;
  propsData?: object;
  computed?: {
    [key: string]:
      | Function
      | {
          get?: Function;
          set?: Function;
          cache?: boolean;
        };
  };
  methods?: { [key: string]: Function };
  watch?: { [key: string]: Function | string };

  // DOM
  el?: string | Element;
  template?: string;
  render: (h: () => VNode) => VNode;
  renderError?: (h: () => VNode, err: Error) => VNode;
  staticRenderFns?: Array<() => VNode>;

  // lifecycle
  beforeCreate?: Function;
  created?: Function;
  beforeMount?: Function;
  mounted?: Function;
  beforeUpdate?: Function;
  updated?: Function;
  activated?: Function;
  deactivated?: Function;
  beforeDestroy?: Function;
  destroyed?: Function;
  errorCaptured?: () => boolean | void;
  serverPrefetch?: Function;
  renderTracked?(e: DebuggerEvent): void;
  renderTriggerd?(e: DebuggerEvent): void;

  // assets
  directives?: { [key: string]: object };
  components?: { [key: string]: Component };
  transitions?: { [key: string]: object };
  filters?: { [key: string]: Function };

  // context
  provide?: Record<string | symbol, any> | (() => Record<string | symbol, any>);
  inject?:
    | { [key: string]: any | { from?: any; default?: any } }
    | Array<string>;

  // component v-model customization
  model?: {
    prop?: string;
    event?: string;
  };

  // misc
  parent?: Component;
  mixins?: Array<object>;
  name?: string;
  extends?: Component | object;
  delimiters?: [string, string];
  comments?: boolean;
  inheritAttrs?: boolean;

  // Legacy API
  abstract?: any;

  // private
  _isComponent?: true;
  _propKeys?: Array<string>;
  _parentVnode?: VNode;
  _parentListeners?: object | null;
  _renderChildren?: Array<VNode> | null;
  _componentTag: string | null;
  _scopeId: string | null;
  _base: typeof Component;
};

export type PropOptions = {
  type?: Function | Array<Function> | null;
  default?: any;
  required?: boolean | null;
  validator?: Function | null;
};

export function resolveAsset(
  options: Record<string, any>,
  type: string,
  id: string,
  warnMissing?: boolean
): any {
  /* istanbul ignore if */
  if (typeof id !== "string") {
    return;
  }
  const assets = options[type];
  // check local registration variations first
  if (hasOwn(assets, id)) return assets[id];
  const camelizedId = camelize(id);
  if (hasOwn(assets, camelizedId)) return assets[camelizedId];
  const PascalCaseId = capitalize(camelizedId);
  if (hasOwn(assets, PascalCaseId)) return assets[PascalCaseId];
  // fallback to prototype chain
  const res = assets[id] || assets[camelizedId] || assets[PascalCaseId];
  return res;
}
