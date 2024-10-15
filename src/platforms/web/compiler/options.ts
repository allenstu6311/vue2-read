import { CompilerOptions } from "../../../types/compiler.js";
import modules from "./modules/index.js";
import { isPreTag, isReservedTag, getTagNamespace } from "../util/element.js";
import { isUnaryTag } from "./utils.js";
import directives from "./directives/index.js";

export const baseOptions: CompilerOptions = {
  expectHTML: true,
  modules,
  directives,
  isUnaryTag,
  isPreTag,
  isReservedTag,
  getTagNamespace,
};
