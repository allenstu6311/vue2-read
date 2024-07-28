import { Component } from "../../types/component";

/**
 * 設置組件父子狀態、生命週期狀態初始值
 */
export function initLifecycle(vm: Component) {
    const options = vm.$options;
    let parent = options.parent;
    // 如果有父组件且当前组件不是抽象组件
    if(parent && !options.abstract){
        // 找到最近的非抽象父组件
        while(parent.$options.abstract && parent.$parent){
            parent = parent.$parent;
        }
        // 将当前组件实例添加到父组件的 $children 数组中
        parent.$children.push(vm)
    }
    // 设置组件实例的父组件和根组件引用
    vm.$parent = parent
    vm.$root = parent ? parent.$root : vm

    // 初始化组件的子组件数组和引用对象
    vm.$children = []
    vm.$refs = {}
    // vm._provided = parent ? parent._provided : Object.create(null)
    vm._watcher = null
    vm._inactive = null
    vm._directInactive = false
    vm._isMounted = false
    vm._isDestroyed = false
    vm._isBeingDestroyed = false
}