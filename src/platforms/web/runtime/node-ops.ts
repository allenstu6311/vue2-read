import { namespaceMap } from "./../util/element.js";
import VNode from "../../../core/vdom/vnode.js";

/**
 * 創建真實的DOM
 * @returns DOM
 */
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

export function appendChild(node: Node, child: Node) {
  node.appendChild(child);
}

export function removeChild(node: Node, child: Node) {
  node.removeChild(child);
}

export function createTextNode(text: string): Text {
  return document.createTextNode(text);
}

export function inserBefore(
  parentNode: Node,
  newNode: Node,
  referenceNode: Node
) {
  parentNode.insertBefore(newNode, referenceNode);
}

export function setStyleScope(node: Element, scopeId: string) {
  node.setAttribute(scopeId, "");
}
