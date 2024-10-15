import { emptyNode } from "../patch.js";
import { VNodeWithData } from "./../../../types/vnode.js";

export default {
  create: updateDirectives,
  update: updateDirectives,
  destory: function unbindDirectives(vnode: VNodeWithData) {
    // @ts-expect-error emptyNode is not VNodeWithData
    updateDirectives(vnode, emptyNode);
  },
};

function updateDirectives(oldVnode: VNodeWithData) {}
