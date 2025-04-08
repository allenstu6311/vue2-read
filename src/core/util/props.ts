import { Component } from "../../types/component.js";

export function validateProp(
  key: string,
  propOptions: Object,
  propsData: Object | any,
  vm?: Component
): any {
  let value = propsData[key];
  return value;
}
