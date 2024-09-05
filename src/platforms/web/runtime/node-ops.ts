import { namespaceMap } from "./../util/element.js";
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

export function createElementNS(namespace: string, tagName: string): Element {
  return document.createElementNS(namespaceMap[namespace], tagName);
}

/**
 * 返回父節點
 */
export function parentNode(node: Node) {
  return node.parentNode;
}

/**
 * 返回標籤名稱
 */
export function tagName(node: Element): string {
  return node.tagName;
}

export function nextSibling(node: Node) {
  return node.nextSibling;
}

export function setStyleScope(node: Element, scopeId: string) {
  node.setAttribute(scopeId, "");
}
