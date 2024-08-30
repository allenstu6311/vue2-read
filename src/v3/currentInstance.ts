import { Component } from "../types/component.js";

export let currentInstance: Component | null = null;

/**
 * 設定currentInstance(當前實例)並調用vm._scope.on()
 */
export function setCurrentInstance(vm: Component | null = null) {
  if (!vm) currentInstance && currentInstance._scope.off();
  currentInstance = vm;
  vm && vm._scope.on();
}
