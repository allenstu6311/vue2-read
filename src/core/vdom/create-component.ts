import { Component } from "../../types/component.js";
import {
  ComponentOptions,
  InternalComponentOptions,
} from "../../types/options.js";
import { VNodeData, VNodeWithData } from "../../types/vnode.js";
import { activeInstance } from "../instance/lifecycle.js";
import { isDef, isObject, isTrue, isUndef } from "../shared/util.js";
import { extractPropsFromVNodeData } from "./helpers/extract-props.js";
import VNode from "./vnode.js";

const componentVNodeHooks = {
  init(vnode: VNodeWithData, hydrating: boolean): boolean | void {
    if (
      vnode.componentInstance &&
      !vnode.componentInstance._isDestroyed &&
      vnode.data.keepAlive
    ) {
    } else {
      const child = (vnode.componentInstance = createComponentInstanceForVnode(
        vnode,
        activeInstance
      ));
      // 為了讓patch判斷這是組件，所以不傳入el
      child.$mount(hydrating ? vnode.elm : undefined, hydrating);
    }
  },
  prepatch() {},
  insert() {},
  destroy() {},
};

const hooksToMerge = Object.keys(componentVNodeHooks);

export function createComponent(
  Ctor: typeof Component | Function | ComponentOptions | void,
  data: VNodeData | undefined,
  context: Component,
  children?: Array<VNode>,
  tag?: string
): VNode | Array<VNode> | void {
  if (isUndef(Ctor)) {
    return;
  }

  let asyncFactory;

  const baseCtor = context.$options._base;

  if (isObject(Ctor)) {
    Ctor = baseCtor.extend(Ctor as typeof Component);
  }

  if (typeof Ctor !== "function") return;
  // @ts-expect-error
  if (isUndef(Ctor.cid)) {
  }

  data = data || {};
  if (isDef(data.model)) {
    // @ts-expect-error
    transformModel(Ctor.options, data);
  }

  // extract props
  // @ts-expect-error
  const propsData = extractPropsFromVNodeData(data, Ctor, tag);

  // functional component
  // @ts-expect-error
  if (isTrue(Ctor.options.functional)) {
  }

  // extract listeners, since these needs to be treated as
  // child component listeners instead of DOM listeners
  const listeners = data.on;
  // replace with listeners with .native modifier
  // so it gets processed during parent component patch.
  data.on = data.nativeOn;

  // install component management hooks onto the placeholder node
  installComponentHooks(data);

  // return a placeholder vnode
  // @ts-expect-error
  const name = getComponentName(Ctor.options) || tag;
  const vnode = new VNode(
    // @ts-expect-error
    `vue-component-${Ctor.cid}${name ? `-${name}` : ""}`,
    data,
    undefined,
    undefined,
    undefined,
    context,
    // @ts-expect-error
    { Ctor, propsData, listeners, tag, children },
    asyncFactory
  );

  return vnode;
}

export function createComponentInstanceForVnode(
  // we know it's MountedComponentVNode but flow doesn't
  vnode: any,
  // activeInstance in lifecycle state
  parent?: any
): Component {
  const options: InternalComponentOptions = {
    _isComponent: true,
    _parentVnode: vnode,
    parent,
  };

  const inlineTemplate = vnode.data.inlineTemplate;

  return new vnode.componentOptions.Ctor(options); //Vue.extend
}

export function getComponentName(options: ComponentOptions) {
  return options.name || options.__name || options._componentTag;
}

// transform component v-model info (value and callback) into
// prop and event handler respectively.
function transformModel(options: any, data: any) {
  const prop = (options.model && options.model.prop) || "value";
  const event = (options.model && options.model.event) || "input";
  (data.attrs || (data.attrs = {}))[prop] = data.model.value;
  const on = data.on || (data.on = {});
  const existing = on[event];
  const callback = data.model.callback;

  if (isDef(existing)) {
  } else {
    on[event] = callback;
  }
}

function installComponentHooks(data: VNodeData) {
  const hooks = data.hook || (data.hook = {});
  for (let i = 0; i < hooksToMerge.length; i++) {
    const key = hooksToMerge[i];
    const existing = hooks[key];
    const toMerge =
      componentVNodeHooks[key as keyof typeof componentVNodeHooks];
    // @ts-expect-error
    if (existing !== toMerge && !(existing && existing._merged)) {
      hooks[key] = existing ? mergeHook(toMerge, existing) : toMerge;
    }
  }
}

function mergeHook(f1: any, f2: any): Function {
  const merged = (a: any, b: any) => {
    // flow complains about extra args which is why we use any
    f1(a, b);
    f2(a, b);
  };
  merged._merged = true;
  return merged;
}
