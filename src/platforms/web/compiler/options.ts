import { CompilerOptions } from "../../../types/compiler.js";
import modules from "./modules/index.js";
import { isPreTag, isReservedTag, getTagNamespace } from "../util/element.js";

export const baseOptions: CompilerOptions = {
  expectHTML: true,
  modules,
  isPreTag,
  isReservedTag,
  getTagNamespace,
};
