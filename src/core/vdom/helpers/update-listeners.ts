import { Component } from "../../../types/component";
import { cached } from "../../util/index.js";

/**
 * validate once passive capture
 */
const normalizeEvent = cached(
  (
    name: string
  ): {
    name: string;
    once: boolean;
    capture: boolean;
    passive: boolean;
    handler?: Function;
    params?: Array<any>;
  } => {
    const passive = name.charAt(0) === "&";
    name = passive ? name.slice(1) : name;
    const once = name.charAt(0) === "~"; // Prefixed last, checked first
    name = once ? name.slice(1) : name;
    const capture = name.charAt(0) === "!";
    name = capture ? name.slice(1) : name;
    return {
      name,
      once,
      capture,
      passive,
    };
  }
);

export function updateListeners(
  on: Object | any,
  oldOn: Object | any,
  add: Function,
  remove: Function,
  createOnceHandler: Function,
  vm: Component
) {
  let name, cur, old, event: any;

  for (name in on) {
    cur = on[name];
    old = oldOn[name];
    event = normalizeEvent(name);

    // 訂閱事件
    add(event.name, cur, event.capture, event.passive, event.params);
  }
}
