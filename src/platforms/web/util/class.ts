import { isDef, isObject } from "../../../core/shared/util.js";
import VNode from "../../../core/vdom/vnode";
import type { VNodeData, VNodeWithData } from "../../../types/vnode.js";

export function genClassForVnode(vnode: VNodeWithData): string {
    let data = vnode.data;
    let parentNode: VNode | VNodeWithData | undefined = vnode;
    let childNode: VNode | VNodeWithData = vnode;

    while (isDef(childNode.componentInstance)) {
        childNode = childNode.componentInstance._vnode!;

        if (childNode && childNode.data) {
            data = mergeClassData(childNode.data, data);
        }
    }

    return renderClass(data.staticClass!, data.class);
}

function mergeClassData(
    child: VNodeData,
    parent: VNodeData
): {
    staticClass: string,
    class: any
} {
    return {
        staticClass: concat(child.staticClass, parent.staticClass),
        class: isDef(child.class) ? [child.class, parent.class] : parent.class
    }
}

function renderClass(
    staticClass: string | null | undefined,
    dynamicClass: any
): string {
    if (isDef(staticClass) || isDef(dynamicClass)) {
        return concat(staticClass, stringifyClass(dynamicClass))
    }
    return ''
}

export function concat(a?: string | null, b?: string | null): string {
    return a ? (b ? a + ' ' + b : a) : b || ''
}

export function stringifyClass(value: any): string {
    if (typeof value === 'string') {
        return value
    }
    /* istanbul ignore next */
    return ''
}