/**
 * Virtual DOM patching algorithm based on Snabbdom by
 * Simon Friis Vindum (@paldepind)
 * Licensed under the MIT License
 * https://github.com/paldepind/snabbdom/blob/master/LICENSE
 *
 * modified by Evan You (@yyx990803)
 *
 * Not type-checking this because this file is perf-critical and the cost
 * of making flow understand it is not worth it.
 */
//@ts-nocheck
import { isDef, isUndef } from "../util/index.js";
import VNode from "./vnode.js";

export const emptyNode = new VNode("", {}, []);
const hooks = ["create", "activate", "update", "remove", "destroy"];

export function createPatchFunction(backend: any) {
  let i, j;
  const cbs: any = {};

  const { modules, nodeOps } = backend;

  for (i = 0; i < hooks.length; ++i) {
    cbs[hooks[i]] = [];
    for (j = 0; j < modules.length; ++j) {
      if (isDef(modules[j][hooks[i]])) {
        cbs[hooks[i]].push(modules[j][hooks[i]]);
      }
    }
  }

  function invokeDestroyHook(vnode) {}

  return function patch(oldVnode, vnode, hydrating, removeOnly) {
    if (isUndef(vnode)) {
      if (isDef(oldVnode)) invokeDestroyHook(oldVnode);
    }
  };
}
