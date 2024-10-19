import {
  ASTElement,
  CompilerOptions,
  ModuleOptions,
} from "../../../../types/compiler.js";

/**
 * Expand input[v-model] with dynamic type bindings into v-if-else chains
 * Turn this:
 *   <input v-model="data[type]" :type="type">
 * into this:
 *   <input v-if="type === 'checkbox'" type="checkbox" v-model="data[type]">
 *   <input v-else-if="type === 'radio'" type="radio" v-model="data[type]">
 *   <input v-else :type="type" v-model="data[type]">
 */
export function preTransformNode(el: ASTElement, options: CompilerOptions) {  
  if (el.tag === "input") {
    const map = el.attrsMap;
    if (!map["v-model"]) return;

    let typeBinding;
    if (map[":type"] || map["v-bind:type"]) {
    }
  }
}

export default {
  preTransformNode,
} as ModuleOptions;
