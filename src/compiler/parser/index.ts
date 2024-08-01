// import { isReservedTag } from './../../platforms/web/util/element';
import { ASTElement, CompilerOptions } from "../../types/compiler.js";
import { no } from "../../core/util/index.js";
import { pluckModuleFunction } from "../helpers.js";

let delimiters;
let transforms;
let preTransforms;
let postTransforms;
let platformIsPreTag;
let platformMustUseProp;
let platformGetTagNamespace;
let maybeComponent;

/**
 * Convert HTML string to AST.
 */
export function parse(template: string, options: CompilerOptions): ASTElement {
  platformIsPreTag = options.isPreTag || no;
  platformMustUseProp = options.mustUseProp || no;
  platformGetTagNamespace = options.getTagNamespace || no;
  const isReservedTag = options.isReservedTag || no;

  maybeComponent = (el: ASTElement) =>
    !!(
      el.component ||
      el.attrsMap[":is"] ||
      el.attrsMap["b-bind:is"] ||
      !(el.attrsMap.is ? isReservedTag(el.attrsMap.is) : isReservedTag(el.tag))
    );

  transforms = pluckModuleFunction(options.modules, "transformNode");
  // preTransforms = pluckModuleFunction(options.modules, "preTransformNode");
  // postTransforms = pluckModuleFunction(options.modules, "postTransformNode");
  console.log("transforms", transforms);
  // console.log("options", options.modules);
  delimiters = options.delimiters;

  const stack: any[] = [];
  const preserveWhitespace = options.preserveWhitespace !== false;
  const whitespaceOption = options.whitespace;
  let root: any;
  let currentParent;
  let inVPre = false;
  let inPre = false;
  let warned = false;

  return root;
}
