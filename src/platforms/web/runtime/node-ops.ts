import VNode from "../../../core/vdom/vnode.js";

export function createElement(tagName: string, vnode: VNode): Element {
  const elm = document.createElement(tagName);
  if (tagName !== "select") return elm;

  // 如果是false, null 會移除該屬性但undefind不會
  if (
    vnode.data &&
    vnode.data.attrs &&
    vnode.data.attrs.multiple !== undefined
  ) {
    elm.setAttribute("multiple", "multiple");
  }
  return elm;
}
