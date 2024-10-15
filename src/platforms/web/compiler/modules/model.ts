import {
  ASTElement,
  CompilerOptions,
  ModuleOptions,
} from "../../../../types/compiler.js";

/**
 *  處理v-model
 *  1.tag需要為input
 *  2.需要在input上寫v-model
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
