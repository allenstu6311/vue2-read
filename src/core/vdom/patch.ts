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
import { isTextInputType } from "../../platforms/web/util/element.js";
import { isArray, isDef, isPrimitive, isTrue, isUndef } from "../util/index.js";
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
   * a andb 是否為相同節點(不一定內容相同)
   * @param a oldVNode
   * @param b currVNode
   */
  function sameVnode(a, b, type) {
    return (
      a.key === b.key &&
      a.asyncFactory === b.asyncFactory &&
      // 標籤
      ((a.tag === b.tag &&
        // 是否為註解
        a.isComment === b.isComment &&
        // 兩邊都有資料
        isDef(a.data) === isDef(b.data) &&
        sameInputType(a, b)) ||
        (isTrue(a.isAsyncPlaceholder) && isUndef(b.asyncFactory.error)))
    );
  }

  /**
   * 1.不是input標籤 return true
   * 2.是input的話比較Type
   */
  function sameInputType(a, b) {
    if (a.tag !== "input") return true;
    let i;
    const typeA = isDef((i = a.data)) && isDef((i = i.attrs)) && i.type;
    const typeB = isDef((i = b.data)) && isDef((i = i.attrs)) && i.type;

    return (
      typeA === typeB || (isTextInputType(typeA) && isTextInputType(typeB))
    );
  }

  /**
   * 回傳舊節的的key map
   * @returns {Object} {key:index}
   */
  function createKeyToOldIdx(children, beginIdx, endIdx) {
    let key;
    const map = {};
    for (let i = beginIdx; i <= endIdx; ++i) {
      key = children[i].key;
      if (isDef(key)) map[key] = i;
    }
    return map;
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

  /**
   * 創建節點
   */
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

    if (createComponent(vnode, insertedVnodeQueue, parentElm, refElm)) {
      return
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

  function createComponent(vnode, insertedVnodeQueue, parentElm, refElm) {
    //createComponent
    let i = vnode.data;
    if (isDef(i)) {       
    }
  }

  /**
   * 創建當前節點子層
   */
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
   * 插入節點(正式將DOM渲染出來)
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

  /**
   * 移除節點
   * @param vnodes
   * @param startIdx
   * @param endIdx
   */
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

  /**
   * 移除舊的節點
   */
  function removeAndInvokeRemoveHook(vnode, rm?: any) {
    if (isDef(rm) || isDef(vnode.data)) {
      let i;
      const listeners = cbs.remove.length + 1;

      if (isDef(rm)) {
        rm.listeners += listeners;
      } else {
        // 給予刪除方法
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
   * 目前用於檢查vnode是否有標籤
   */
  function isPatchable(vnode) {
    return isDef(vnode.tag);
  }

  /**
   * vue diff算法
   */
  function updateChildren(
    parentElm, //真實DOM
    oldCh: Array<VNode>,
    newCh: Array<VNode>,
    insertedVnodeQueue,
    removeOnly
  ) {
    // 節點索引
    let oldStartIdx = 0;
    let oldEndIdx = oldCh.length - 1;
    let newStartIdx = 0;
    let newEndIdx = newCh.length - 1;
    // 舊節點
    let oldStartVnode = oldCh[0];
    let oldEndVnode = oldCh[oldEndIdx];
    //新節點
    let newStartVnode = newCh[0];
    let newEndVnode = newCh[newEndIdx];

    let oldKeyToIdx, //當前舊節點key,value
      idxInOld, //當前舊節點 index
      vnodeToMove, //被移動的VNode
      refElm; //相鄰的節點

    const canmove = !removeOnly;

    // console.log("parentElm", parentElm);
    // console.log("oldEndIdx", oldEndIdx);
    // console.log("oldStartVnode", oldStartVnode);
    // console.log("newStartVnode", newStartVnode);

    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
      if (isUndef(oldStartVnode)) {
        //已經被移動或刪除，直接跳過
      } else if (isUndef(oldEndVnode)) {
        //已經被移動或刪除，直接跳過
      } else if (sameVnode(oldStartVnode, newStartVnode)) {
        //新舊列表的頭部節點是相同時，直接更新它們(oldStart vs newStar)
        // console.log("1");
        patchVnode(
          oldStartVnode,
          newStartVnode,
          insertedVnodeQueue,
          newCh,
          newStartIdx
        );

        // 更新頭部index
        oldStartVnode = oldCh[++oldStartIdx];
        newStartVnode = newCh[++newStartIdx];
        // console.log("oldStartVnode", oldStartVnode, "oldStartIdx", oldStartIdx);
        // console.log("newStartVnode", newStartVnode, "newStartIdx", newStartIdx);
      } else if (sameVnode(oldEndVnode, newEndVnode)) {
        //新舊列表的尾部節點是相同時，直接更新它們(oldEnd vs newEnd)
        // console.log("2");
        patchVnode(
          oldEndVnode,
          newEndVnode,
          insertedVnodeQueue,
          newCh,
          newEndIdx
        );
        // 更新尾部index
        oldEndVnode = oldCh[--oldEndIdx];
        newEndVnode = newCh[--newEndIdx];

      }
      else if (sameVnode(oldStartVnode, newEndVnode)) {
        //DOM可能只是受到移位，避免直接創造新節點，增加舊節點得重用性(oldStart vs newEnd)
        // console.log("3");

        patchVnode(
          oldStartVnode,
          newEndVnode,
          insertedVnodeQueue,
          newCh,
          newEndIdx
        );
        canmove &&
          nodeOps.inserBefore(
            parentElm,
            oldStartVnode.elm,
            nodeOps.nextSibling(oldEndVnode.elm)
          );
        oldStartVnode = oldCh[++oldStartIdx];
        newEndVnode = newCh[--newEndIdx];
      } else if (sameVnode(oldEndVnode, newStartVnode)) {
        //DOM可能只是受到移位，避免直接創造新節點，增加舊節點得重用性(oldStart vs newEnd)
        // console.log("4444");
      } else {
        // console.log("5");

        //無法匹配，可能是新元素
        if (isUndef(oldKeyToIdx)) {
          oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
          idxInOld = isDef(newStartVnode.key)
            ? oldKeyToIdx[newStartVnode.key]
            : findIdxInOld(newEndVnode, oldCh, oldStartIdx, oldEndIdx);
        }

        //沒有在當前舊節點找到與新節點相同的內容
        if (isUndef(idxInOld)) {
          // 全新節點
          createElm(
            newStartVnode,
            insertedVnodeQueue,
            parentElm,
            oldStartVnode.elm,
            false,
            newCh,
            newStartIdx
          );
        } else {
          // 暫時找不到條件
          console.log("same key");
          // 有找到代表只是位子被移動
          vnodeToMove = oldCh[idxInOld];
          if (sameVnode(vnodeToMove, newStartVnode)) {
          }
        }
        newStartVnode = newCh[++newStartIdx];
      }
    }

    // console.log("oldStartIdx : ", oldStartIdx, "oldEndIdx : ", oldEndIdx);
    // console.log("newStartIdx : ", newStartIdx, "newEndIdx : ", newEndIdx);
    if (oldStartIdx > oldEndIdx) {
      refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm;
      /**
       * 確認舊節點遍立完畢，才開始新增
       */
      addVnodes(
        parentElm,
        refElm,
        newCh,
        newStartIdx,
        newEndIdx,
        insertedVnodeQueue
      );
    } else if (newStartIdx > newEndIdx) {
      /**
       * 新節點已遍利完畢，剩下都是刪除
       */
      removeVnodes(oldCh, oldStartIdx, oldEndIdx);
    }
  }

  /**
   * vue diff算法
   */
  function patchVnode(
    oldVnode,
    vnode,
    insertedVnodeQueue,
    ownerArray: Array<VNode>,
    index, // 新節點索引
    removeOnly?: any
  ) {
    // 極少數情況可能物件會重用
    if (oldVnode === vnode) return;

    const elm = (vnode.elm = oldVnode.elm); //parent
    // console.log("oldVnode", oldVnode);
    // console.log("vnode", vnode);
    // console.log("elm", elm);
    // console.log("vnode text", vnode);

    // if(isTrue(oldVnode.isAsyncPlaceholder)){} 暫時沒有使用
    // if (isTrue(vnode.isStatic) 暫時沒有使用

    let i;
    const data = vnode.data;
    // if(isDef(data) && isDef(i = data.hook) && isDef((i = i.prepatch))){}
    const oldCh = oldVnode.children;
    const ch = vnode.children;

    // if (isDef(data) && isPatchable(vnode)) {
    //   // cbs update
    //   for (i = 0; i < cbs.update.length; ++i) cbs.update[i](oldVnode, vnode);
    // }
    // console.log("oldCh", oldCh);
    // console.log("ch", ch);

    if (isUndef(vnode.text)) {
      if (isDef(oldCh) && isDef(ch)) {
        if (oldCh != ch) {
          updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly);
        }
      } else if (isDef(ch)) {
        // 新元素
        // addVnodes(elm, null, ch, 0, cb.length - 1, insertedVnodeQueue);
        console.log("isDef(ch)");
      } else if (isDef(oldCh)) {
        console.log("isDef(oldCh)");
        // 舊元素
      } else if (isDef(oldVnode.text)) {
        console.log("old text");
        // 舊元素文字
      }
    } else if (oldVnode.text !== vnode.text) {
      // 處理節點文字
      nodeOps.setTextContent(elm, vnode.text);
    }

    if (isDef(data)) {
      // console.log("final", data);
    }
  }

  /**
   * 新增節點
   */
  function addVnodes(
    parentElm,
    refElm,
    vnodes: Array<VNode>, //新節點陣列
    startIdx,
    endIdx,
    insertedVnodeQueue
  ) {
    for (; startIdx <= endIdx; ++startIdx) {      
      createElm(
        vnodes[startIdx],
        insertedVnodeQueue,
        parentElm,
        refElm,
        false,
        vnodes,
        startIdx
      );
    }
  }

  /**
   * 回傳舊節點的index
   * @param node 新節點(頭)
   * @param oldCh
   * @param start 舊節點start index
   * @param end 舊節點end index
   * @returns index
   */
  function findIdxInOld(node, oldCh, start, end) {
    for (let i = start; i < end; i++) {
      const c = oldCh[i];
      if (isDef(c) && sameVnode(node, c)) return i;
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
      // 虛擬DOM不會有NodeType所以用來判斷是否為虛擬DOM更新
      const isRealElement = isDef(oldVnode.nodeType);

      if (!isRealElement && sameVnode(oldVnode, vnode)) {
        // update
        patchVnode(oldVnode, vnode, insertedVnodeQueue, null, null, removeOnly);
      } else {
        // create
        if (isRealElement) {
          // dom => vdom
          oldVnode = emptyNodeAt(oldVnode);
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
      }
    }
    return vnode.elm;
  };
}
