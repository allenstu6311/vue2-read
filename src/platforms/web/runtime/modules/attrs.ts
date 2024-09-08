import { VNodeWithData } from "../../../../types/vnode.js";
import { isBooleanAttr, isEnumeratedAttr, isFalsyAttrValue, isXlink } from "../../util/attrs.js";

function updateAttrs(oldVnode: VNodeWithData, vnode: VNodeWithData) {
    const opts = vnode.componentOptions;

    let key, cur, old;
    const elm = vnode.elm;
    const oldAttrs = oldVnode.data.attrs || {};
    let attrs: any = vnode.data.attrs || {};

    for (key in attrs) {
        cur = attrs[key];
        old = oldAttrs[key];

        if (old !== cur) {
            setAttr(elm, key, cur, vnode.data.pre)
        }
    }

}

function setAttr(el: Element, key: string, value: any, isInPre?: any) {
    if (isInPre || el.tagName.indexOf('-') > -1) {

    } else if (isBooleanAttr(key)) {

    } else if (isEnumeratedAttr(key)) {

    } else if (isXlink(key)) {

    } else {
        baseSetAttr(el, key, value);
    }
}


function baseSetAttr(el: Element, key: string, value: any) {
   
    if (isFalsyAttrValue(value)) {
        el.removeAttribute(key);
    } else {
        el.setAttribute(key, value);
    }
}

export default {
    create: updateAttrs,
    update: updateAttrs
}