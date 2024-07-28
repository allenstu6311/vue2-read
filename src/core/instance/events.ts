import { Component } from "../../types/component";

/**
 * 
 */
export function initEvents(vm: Component) {
    vm._events = Object.create(null);
    vm._hasHookEvent = false;

    const listeners = vm.$options._parentListeners
    if (listeners) {
        updateComponentListeners(vm, listeners)
    }
}

export function updateComponentListeners(
    vm: Component,
    listeners: Object,
    oldListeners?: Object | null
) { }