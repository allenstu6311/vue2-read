import { isUndef } from "../../../../core/util/index.js";
import { updateListeners } from "../../../../core/vdom/helpers/update-listeners.js";
import { VNodeWithData } from "../../../../types/vnode.js";

let target: any;

// v-model相關
function normalizeEvents() {}

/**
 * 事件綁定
 */
function add(
  name: string,
  handler: Function,
  capture: boolean,
  passive: boolean
) {
  target.addEventListener(name, handler);
}

/**
 * 解除事件
 */
function remove(
  name: string,
  handler: Function,
  capture: boolean,
  _target?: HTMLElement
) {
  (_target || target).removeEventListener(
    name,
    //@ts-expect-error
    handler._wrapper || handler,
    capture
  );
}

function createOnceHandler() {}

function updateDOMListeners(oldVnode: VNodeWithData, vnode: VNodeWithData) {
  if (isUndef(oldVnode.data.on) && isUndef(vnode.data.on)) return;

  const on = vnode.data.on || {};
  const oldOn = oldVnode.data.on || {};

  target = vnode.elm || oldVnode.elm;
  //normalizeEvents()
  updateListeners(on, oldOn, add, remove, createOnceHandler, vnode.context);
  target = undefined;
}

export default {
  create: updateDOMListeners,
  update: updateDOMListeners,
  // @ts-expect-error emptyNode has actually data
  destroy: (vnode: VNodeWithData) => updateDOMListeners(vnode, emptyNode),
};
