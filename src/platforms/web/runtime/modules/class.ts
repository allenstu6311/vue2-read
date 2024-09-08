import { isUndef } from "../../../../core/util/index.js";
import { VNodeData } from "../../../../types/vnode.js";
import { genClassForVnode } from "../../util/class.js";

function updateClass(oldVnode: any, vnode: any) {

    const el = vnode.elm;
    const data: VNodeData = vnode.data;
    const oldData: VNodeData = oldVnode.data;

    if (isUndef(data.staticClass) &&
        isUndef(data.class) &&
        (isUndef(oldData) ||
            ((isUndef(oldData.staticClass) && isUndef(oldData.class))))) {
        return
    }

    let cls = genClassForVnode(vnode);

    if (el !== el._prevClass) {
        el.setAttribute('class', cls);
        el._prevClass = cls;
    }
}

export default {
    create: updateClass,
    update: updateClass,
}