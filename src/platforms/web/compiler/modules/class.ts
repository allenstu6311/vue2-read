import {
  ASTElement,
  CompilerOptions,
  ModuleOptions,
} from "../../../../types/compiler.js";
import { baseWarn, getAndRemoveAttr } from "../../../../compiler/helpers.js";

/**
 * 生成class
 */
function transformNode(el: ASTElement, options: CompilerOptions) {
  const warn = options.warn || baseWarn;
  const staticClass = getAndRemoveAttr(el, "class"); //會移除attrsList中帶有class的屬性

  if (staticClass) {
    el.staticClass = JSON.stringify(staticClass.replace(/\s+/g, " ").trim());
  }
  //   const classBinding =
}

/**
 * 生成class
 */
function genData(el: ASTElement): string {
  let data = "";
  if (el.staticClass) {
    data += `staticClass:${el.staticClass},`;
  }
  if (el.classBinding) {
    data += `class:${el.classBinding},`;
  }
  return data;
}

export default {
  transformNode,
  genData,
} as ModuleOptions;
