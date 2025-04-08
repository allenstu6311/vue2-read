import { observe, Observer } from "../../core/observer/index.js";
import { def } from "../../core/util/index.js";

export const enum ReactiveFlags {
  SKIP = "__v_skip",
  IS_READONLY = "__v_isReadonly",
  IS_SHALLOW = "__v_isShallow",
  RAW = "__v_raw",
}

export interface Target {
  __ob__?: Observer;
  [ReactiveFlags.SKIP]?: boolean;
  [ReactiveFlags.IS_READONLY]?: boolean;
  [ReactiveFlags.IS_SHALLOW]?: boolean;
  [ReactiveFlags.RAW]?: any;
}

export declare const ShallowReactiveMarker: unique symbol;
export type ShallowReactive<T> = T & { [ShallowReactiveMarker]?: true };

export function shallowReactive<T extends object>(
  target: T
): ShallowReactive<T> {
  makeReactive(target, true);
  def(target, ReactiveFlags.IS_SHALLOW, true);
  return target;
}

function makeReactive(target: any, shallow: boolean) {
  if (!isReadonly(target)) {
    const ob = observe(
      target,
      shallow
      // isServerRendering() /* ssr mock reactivity */
    );
  }
}

export function isReadonly(value: unknown): boolean {
  return !!(value && (value as Target).__v_isReadonly);
}
