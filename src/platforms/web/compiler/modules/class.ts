import {
  ASTElement,
  CompilerOptions,
  ModuleOptions,
} from "../../../../types/compiler.js";
import { baseWarn, getAndRemoveAttr } from "../../../../compiler/helpers.js";

function transformNode(el: ASTElement, options: CompilerOptions) {
  const warn = options.warn || baseWarn;
  const staticClass = getAndRemoveAttr(el, "class");

  if (staticClass) {
    el.staticClass = JSON.stringify(staticClass.replace(/\s+/g, " ").trim());
  }
  //   const classBinding =
}

export default {
  transformNode,
} as ModuleOptions;
