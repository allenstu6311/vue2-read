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
import { isArray, isDef, isPrimitive, isUndef } from "../util/index.js";
import VNode, { cloneVNode } from "./vnode.js";

export const emptyNode = new VNode("", {}, []);
const hooks = ["create", "activate", "update", "remove", "destroy"];

export function createPatchFunction(backend: any) {
  let i, j;
  /**
   * 集合所有的回調函數
   * updateAttrs
   * updateClass
   * updateDirective
   */
  const cbs: any = {};

  const { modules, nodeOps } = backend;
  // console.log('modules',modules)
  // console.log('nodeOps',nodeOps)

  for (i = 0; i < hooks.length; ++i) {
    cbs[hooks[i]] = [];
    for (j = 0; j < modules.length; ++j) {
      if (isDef(modules[j][hooks[i]])) {
        cbs[hooks[i]].push(modules[j][hooks[i]]);
      }
    }
  }

  /**
   * dom => vdom
   */
  function emptyNodeAt(elm) {
    return new VNode(
      nodeOps.tagName(elm).toLowerCase(),
      {},
      [],
      undefined,
      elm
    );
  }

  function invokeDestroyHook(vnode) {}

  /**
   * css scoped
   * 設定作用域
   */
  function setScope(vnode) {
    let i;
    if (isDef((i = vnode.fnScopeId))) {
      nodeOps.setStyleScope(vnode.elm, i);
    } else {
      let ancetor = vnode;

      while (ancetor) {
        if (isDef((i = ancetor.context)) && isDef((i = i.$options._scopeId))) {
          nodeOps.setStyleScope(vnode.elm, i);
        }
        ancetor = ancetor.parent;
      }
    }
  }

  /**
   * 調用以下函數創建標籤內容
   * updateAttrs
   * updateClass
   * updateDirective
   */
  function invokeCreateHooks(vnode, insertedVnodeQueue) {
    for (let i = 0; i < cbs.create.length; i++) {
      cbs.create[i](emptyNode, vnode);
    }
    // i = vnode.data.hook // 重複使用變數
  }

  function createElm(
    vnode,
    insertedVnodeQueue,
    parentElm?: any,
    refElm?: any, //相鄰的節點
    nested?: any,
    ownerArray?: any,
    index?: any
  ) {
    if (isDef(vnode.elm) && isDef(ownerArray)) {
      vnode = ownerArray[index] = cloneVNode(vnode);
    }

    const data = vnode.data;
    const children = vnode.children;
    const tag = vnode.tag;
    // console.log("data", data);
    // console.log("children", children);
    // console.log("tag", tag);

    if (isDef(tag)) {
      // ns=>是否為svg或xml等特殊標籤
      vnode.elm = vnode.ns
        ? nodeOps.createElementNS(vnode.ns, tag)
        : nodeOps.createElement(tag, vnode); // 創建真實DOM

      setScope(vnode);
      createChildren(vnode, children, insertedVnodeQueue);
      if (isDef(data)) {
        invokeCreateHooks(vnode, insertedVnodeQueue);
      }

      insert(parentElm, vnode.elm, refElm);
    } else {
      vnode.elm = nodeOps.createTextNode(vnode.text);
      insert(parentElm, vnode.elm, refElm);
    }
  }

  function createChildren(vnode, children, insertedVnodeQueue) {
    if (isArray(children)) {
      for (let i = 0; i < children.length; i++) {
        createElm(
          children[i],
          insertedVnodeQueue,
          vnode.elm,
          null,
          true,
          children,
          i
        );
      }
    } else if (isPrimitive(vnode.text)) {
      nodeOps.appenChild(vnode.elm, nodeOps.createTextNode(String(vnode.text)));
    }
  }

  /**
   * 插入節點
   * @param parent
   * @param elm 標籤內容
   * @param ref 相鄰節點
   */
  function insert(parent, elm, ref) {
    if (isDef(parent)) {
      if (isDef(ref)) {
        if (nodeOps.parentNode(ref) === parent) {
          nodeOps.inserBefore(parent, elm, ref);
        }
      } else {
        nodeOps.appendChild(parent, elm);
      }
    }
  }

  /**
   * 創建vnode被移除時的call back
   */
  function createRmCb(childElm, listeners) {
    function remove() {
      if (--remove.listeners === 0) {
        removeNode(childElm);
      }
    }
    remove.listeners = listeners;
    return remove;
  }

  function removeNode(el) {
    const parent = nodeOps.parentNode(el);
    // 有可能b-html或v-text已被刪除
    if (isDef(parent)) {
      nodeOps.removeChild(parent, el);
    }
  }

  function removeVnodes(vnodes, startIdx, endIdx) {
    for (; startIdx <= endIdx; ++startIdx) {
      const ch = vnodes[startIdx];
      if (isDef(ch)) {
        if (isDef(ch.tag)) {
          removeAndInvokeRemoveHook(ch);
        }
      }
    }
  }

  function removeAndInvokeRemoveHook(vnode, rm?: any) {
    if (isDef(rm) || isDef(vnode.data)) {
      let i;
      const listeners = cbs.remove.length + 1;

      if (isDef(rm)) {
        rm.listeners += listeners;
      } else {
        rm = createRmCb(vnode.elm, listeners);
      }

      for (let i = 0; i < cbs.remove.length; i++) {
        cbs.remove[i](vnode, rm);
      }

      if (isDef((i = vnode.data.hook)) && isDef((i = i.remove))) {
        i(vnode, rm);
      } else {
        // 移除舊節點
        rm();
      }
    }
  }

  /**
   * oldVonde #app
   */
  return function patch(oldVnode, vnode, hydrating, removeOnly) {
    // console.log("oldVnode", oldVnode);
    // console.log("vnode", vnode);
    if (isUndef(vnode)) {
      if (isDef(oldVnode)) invokeDestroyHook(oldVnode);
      return;
    }

    let isInitialPatch = false;
    const insertedVnodeQueue: any[] = []; // 插入vnode對列

    if (isUndef(oldVnode)) {
    } else {
      const isRealElement = isDef(oldVnode.nodeType);

      if (isRealElement) {
        // dom => vdom
        oldVnode = emptyNodeAt(oldVnode);
      }
    }

    const oldElm = oldVnode.elm;
    const parentElm = nodeOps.parentNode(oldElm);

    createElm(
      vnode,
      insertedVnodeQueue,
      oldElm._leaveCb ? null : parentElm,
      nodeOps.nextSibling(oldElm)
    );

    if (isDef(parentElm)) {
      removeVnodes([oldVnode], 0, 0);
    }

    return vnode.elm;
  };
}
