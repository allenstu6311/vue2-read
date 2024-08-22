import Watcher, { WatcherOptions } from "./../observer/watcher.js";
import { Component } from "../../types/component";
import {
  currentInstance,
  setCurrentInstance,
} from "../../v3/currentInstance.js";
import { getCurrentScope } from "../../v3/reactivity/effectScope.js";
import { popTarget, pushTarget } from "../observer/dep.js";
import { createEmptyVNode } from "../vdom/vnode.js";
import { noop } from "../shared/util.js";

/**
 * 設置組件父子狀態、生命週期狀態初始值
 */
export function initLifecycle(vm: Component) {
  const options = vm.$options;
  let parent = options.parent;
  // 如果有父组件且当前组件不是抽象组件
  if (parent && !options.abstract) {
    // 找到最近的非抽象父组件
    while (parent.$options.abstract && parent.$parent) {
      parent = parent.$parent;
    }
    // 将当前组件实例添加到父组件的 $children 数组中
    parent.$children.push(vm);
  }
  // 设置组件实例的父组件和根组件引用
  vm.$parent = parent;
  vm.$root = parent ? parent.$root : vm;

  // 初始化组件的子组件数组和引用对象
  vm.$children = [];
  vm.$refs = {};
  // vm._provided = parent ? parent._provided : Object.create(null)
  vm._watcher = null;
  vm._inactive = null;
  vm._directInactive = false;
  vm._isMounted = false;
  vm._isDestroyed = false;
  vm._isBeingDestroyed = false;
}

export function mountComponent(
  vm: Component,
  el: Element | null | undefined,
  hydrating?: boolean
): Component {
  vm.$el = el;

  if (!vm.$options.render) {
    // @ts-expect-error invalid type
    vm.$options.render = createEmptyVNode;
  }
  callHook(vm, "beforeMount");
  let updateComponent;

  updateComponent = () => {
    vm._update(vm._render(), hydrating);
  };

  const watcherOptions: WatcherOptions = {
    before() {},
  };

  new Watcher(
    vm,
    updateComponent,
    noop,
    watcherOptions,
    true /* isRenderWatcher */
  );
  hydrating = false;

  if (vm.$vnode == null) {
    vm._isMounted = true;
    callHook(vm, "mounted");
  }

  return vm;
}

export function callHook(
  vm: Component,
  hook: string,
  args?: any[],
  setContext = true //設定上下文
) {
  pushTarget();
  const preInst = currentInstance;
  const prevScope = getCurrentScope();
  setContext && setCurrentInstance(vm);
  const handlers = vm.$options[hook];
  const info = `${hook} hook`;

  //   if (handlers) {}

  popTarget();
}
