import {
  isDef,
  isTrue,
  isUndef,
  toNumber,
} from "../../../../core/shared/util.js";
import { VNodeWithData } from "../../../../types/vnode.js";

let svgContainer;

function updateDOMProps(oldVnode: VNodeWithData, vnode: VNodeWithData) {
  if (isUndef(oldVnode.data.domProps) && isUndef(vnode.data.domProps)) return;
  let key, cur;
  const elm: any = vnode.elm;
  const oldProps = oldVnode.data.domProps || {};
  let props = vnode.data.domProps || {};
  //   console.log("props", props);
  //   console.log("vnode", vnode);

  //   if (isDef(props.__ob__) || isTrue(props._v_attr_proxy)) {
  //   }

  for (key in oldProps) {
    if (!(key in props)) {
      elm[key] = "";
    }
  }

  for (key in props) {
    cur = props[key];

    if (key === "value" && elm.tagName !== "PROGRESS") {
      // 進行值得比較時可以使用.value會被轉成字串
      elm._value = cur;

      const strCur = isUndef(cur) ? "" : String(cur);
      if (shouldUpdateValue(elm, strCur)) {
        elm.value = strCur;
      }
    }
  }
}

// check platforms/web/util/attrs.js acceptValue
type acceptValueElm = HTMLInputElement | HTMLSelectElement | HTMLOptionElement;

function shouldUpdateValue(elm: acceptValueElm, checkVal: string): boolean {
  return (
    // @ts-expect-error
    !elm.composing &&
    (elm.tagName === "OPTION" ||
      isNotInFocusAndDirty(elm, checkVal) ||
      isDirtyWithModifiers(elm, checkVal))
  );
}

/**
 * 檢查元素是否失去焦點且值是否與傳入的值不同
 */
function isNotInFocusAndDirty(elm: acceptValueElm, checkVal: string): boolean {
  let notInFocus = true;

  notInFocus = document.activeElement !== elm;
  return notInFocus && elm.value !== checkVal;
}

/**
 * 已修改以及有附加
 */
function isDirtyWithModifiers(elm: any, newVal: string): boolean {
  const value = elm.value;
  const modifiers = elm._vModifiers; //.number | .trim

  if (isDef(modifiers)) {
    if (modifiers.number) {
      return toNumber(value) !== toNumber(newVal);
    }
    if (modifiers.trim) {
      return value.trim() !== newVal.trim();
    }
  }
  return value !== newVal;
}

export default {
  create: updateDOMProps,
  update: updateDOMProps,
};
