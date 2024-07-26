import { ASTModifiers } from "./compiler";
import { Component } from "./component";
import VNode from "../core/vdom/vnode";

/**
 * @internal
 */
export type VNodeChildren =
  | Array<null | VNode | string | number | VNodeChildren>
  | string;

/**
 * @internal
 */
export type VNodeComponentOptions = {
  Ctor: typeof Component;
  propsData?: Object;
  listeners?: Record<string, Function | Function[]>;
  children?: Array<VNode>;
  tag?: string;
};

/**
 * @internal
 */
export interface VNodeData {
  key?: string | number;
  slot?: string;
  ref?: string | ((el: any) => void);
  is?: string;
  pre?: boolean;
  tag?: string;
  staticClass?: string;
  class?: any;
  staticStyle?: { [key: string]: any };
  style?: string | Array<Object> | Object;
  normalizedStyle?: Object;
  props?: { [key: string]: any };
  attrs?: { [key: string]: string };
  domProps?: { [key: string]: any };
  hook?: { [key: string]: Function };
  on?: { [key: string]: Function | Array<Function> };
  nativeOn?: { [key: string]: Function | Array<Function> };
  transition?: Object;
  show?: boolean; // marker for v-show
  inlineTemplate?: {
    render: Function;
    staticRenderFns: Array<Function>;
  };
  directives?: Array<VNodeDirective>;
  keepAlive?: boolean;
  scopedSlots?: { [key: string]: Function };
  model?: {
    value: any;
    callback: Function;
  };

  [key: string]: any;
}

/**
 * @internal
 */
export type VNodeDirective = {
  name: string;
  rawName: string;
  value?: any;
  oldValue?: any;
  arg?: string;
  oldArg?: string;
  modifiers?: ASTModifiers;
  def?: Object;
};

/**
 * @internal
 */
export type ScopedSlotsData = Array<
  { key: string; fn: Function } | ScopedSlotsData
>;
