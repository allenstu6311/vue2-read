// import { isReservedTag } from './../../platforms/web/util/element';
import { ASTAttr, ASTElement, CompilerOptions } from "../../types/compiler.js";
import { no } from "../../core/util/index.js";
import { pluckModuleFunction } from "../helpers.js";
import { parseHTML } from "./html-parser.js";
import { getAndRemoveAttr } from "../helpers.js";


let delimiters;
let transforms;
let preTransforms: any;
let postTransforms;
let platformIsPreTag;
let platformMustUseProp;
let platformGetTagNamespace;
let maybeComponent;

/**
 * 製作AST對象(並產生attrsMap)
 */
export function createASTElement(
  tag: string,
  attrs: Array<ASTAttr>,
  parent: ASTElement | void,
): ASTElement {
  return {
    type: 1,
    tag,
    attrsList: attrs,
    attrsMap: makeAttrsMap(attrs),
    rawAttrsMap: {},
    parent,
    children: []
  }
}

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
  preTransforms = pluckModuleFunction(options.modules, "preTransformNode");
  postTransforms = pluckModuleFunction(options.modules, "postTransformNode");
  // console.log("preTransforms", preTransforms);
  // console.log("options", options.modules);
  delimiters = options.delimiters;

  const stack: any[] = [];
  const preserveWhitespace = options.preserveWhitespace !== false;
  const whitespaceOption = options.whitespace;
  let root: any;
  let currentParent: any;
  let inVPre = false;
  let inPre = false;
  let warned = false;

  parseHTML(template, {
    expectHTML: options.expectHTML,
    isUnaryTag: options.isUnaryTag,
    canBeLeftOpenTag: options.canBeLeftOpenTag,
    shouldDecodeNewlines: options.shouldDecodeNewlines,
    shouldDecodeNewlinesForHref: options.shouldDecodeNewlinesForHref,
    shouldKeepComment: options.comments,
    outputSourceRange: options.outputSourceRange,

    start(tag, attrs, unary, start, end) {
      let element: ASTElement = createASTElement(tag, attrs, currentParent)
      // console.log('element', element)
      // 處理input v-model
      for (let i = 0; i < preTransforms.length; i++) {
        element = preTransforms[i](element, options) || element;
      }

      if (!inVPre) {
        proceePre(element);
      }

    },
    end() { }
  })

  return root;
}

/**
 * handle v-pre (不須經過vue資料綁定項目)
 */
function proceePre(el: any) {
  console.log('proceePre',el)
  if (getAndRemoveAttr(el, 'v-pre') != null) {
    el.pre = true;
  }
}

/**
 * {name:id, value:app} => {id:app}
 */
function makeAttrsMap(attrs: Array<Record<string, any>>): Record<string, any> {
  const map:any = {}
  for (let i = 0, l = attrs.length; i < l; i++) {
    map[attrs[i].name] = attrs[i].value
  }
  return map
}
