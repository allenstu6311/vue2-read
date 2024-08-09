import {
  ASTAttr,
  ASTElement,
  ASTNode,
  CompilerOptions,
} from "../../types/compiler.js";
import { no } from "../../core/util/index.js";
import { addAttr, getBindingAttr, pluckModuleFunction } from "../helpers.js";
import { parseHTML } from "./html-parser.js";
import { getAndRemoveAttr } from "../helpers.js";
import { parseText } from "./text-parser.js";

export const dirRE = false ? /^v-|^@|^:|^\.|^#/ : /^v-|^@|^:|^#/;

let delimiters: any;
let transforms: any;
let preTransforms: any;
let postTransforms: any;
let platformIsPreTag: any;
let platformMustUseProp;
let platformGetTagNamespace;
let maybeComponent;

/**
 * 製作AST對象(並產生attrsMap)
 */
export function createASTElement(
  tag: string,
  attrs: Array<ASTAttr>,
  parent: ASTElement | void
): ASTElement {
  return {
    type: 1,
    tag,
    attrsList: attrs,
    attrsMap: makeAttrsMap(attrs),
    rawAttrsMap: {},
    parent,
    children: [],
  };
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
  let inVPre = false; // 判斷是否需要vue編譯
  let inPre = false; // 檢查是否為pre標籤
  let warned = false;

  function closeElement(element: any) {
    trimEndingWhitespace(element);

    if (!inVPre && !element.processed) {
      element = processElement(element, options);
    }
    // if (!stack.length && element !== root) {}

    if (currentParent && !element.forbidden) {
      currentParent.children.push(element);
      element.parent = currentParent;
    }
  }

  /**
   * 刪除空白節點
   * <div id="app">
   *   <p>test</p>
   *   " delete area "
   *   <p>test</p>
   * </div>
   */
  function trimEndingWhitespace(el: any) {
    if (!inPre) {
      let lastNode;
      while (
        (lastNode = el.children[el.children.length - 1]) &&
        lastNode.type === 3 &&
        lastNode.text === " "
      ) {
        el.children.pop();
      }
    }
  }

  parseHTML(template, {
    expectHTML: options.expectHTML,
    isUnaryTag: options.isUnaryTag,
    canBeLeftOpenTag: options.canBeLeftOpenTag,
    shouldDecodeNewlines: options.shouldDecodeNewlines,
    shouldDecodeNewlinesForHref: options.shouldDecodeNewlinesForHref,
    shouldKeepComment: options.comments,
    outputSourceRange: options.outputSourceRange,

    start(tag, attrs, unary, start, end) {
      let element: ASTElement = createASTElement(tag, attrs, currentParent);
      // console.log("start", element);
      // 處理input v-model
      for (let i = 0; i < preTransforms.length; i++) {
        element = preTransforms[i](element, options) || element;
      }

      if (!inVPre) {
        // 檢查是否有 v-pre
        proceePre(element);
        if (element.pre) {
          inVPre = true;
        }
      }

      // 檢查是否為pre標籤
      if (platformIsPreTag(element.tag)) inPre = true;

      if (inPre) {
        // 暫時先不測試
      } else {
        // v-for,v-if邏輯
      }

      if (!root) {
        root = element;
      }

      if (!unary) {
        //賦值當前父層
        currentParent = element;
        stack.push(element);
      }
    },
    end(tag, start, end) {
      const element = stack[stack.length - 1];
      // pop stack
      stack.length -= 1;
      currentParent = stack[stack.length - 1];
      closeElement(element);
    },

    chars(text: string, start?: number, end?: number) {
      if (!currentParent) return;
      const children = currentParent.children;

      if (inPre || text.trim()) {
      } else if (!children.length) {
        text = "";
      }

      if (text) {
        let res;
        let child: ASTNode | undefined;
        if (!inVPre && text !== " " && (res = parseText(text, delimiters))) {
          child = {
            type: 2,
            expression: res.expression,
            tokens: res.tokens,
            text,
          };
        }

        if (child) {
          children.push(child);
        }
      }
    },
  });

  return root;
}

/**
 * handle v-pre (不須經過vue資料綁定項目)
 */
function proceePre(el: any) {
  if (getAndRemoveAttr(el, "v-pre") != null) {
    el.pre = true;
  }
}

/**
 *
 */
export function processElement(element: ASTElement, options: CompilerOptions) {
  processKey(element);
  //判斷是否為普通元素(沒有任何指令)
  element.plain =
    !element.key && !element.scopedSlots && !element.attrsList.length;

  // ref
  // slot
  // component

  for (let i = 0; i < transforms.length; i++) {
    element = transforms[i](element, options) || element;
  }
  processAttrs(element);
  return element;

  /**
   * :key="item.id"
   */
  function processKey(el: any) {
    const exp = getBindingAttr(el, "key");
    if (exp) el.key = exp;
  }
  /**
   *
   */
  function processAttrs(el: any) {
    const list = el.attrsList;
    let i, l, name, rawName, value, modifiers, syncGen, isDynamic;

    for (let i = 0; i < list.length; i++) {
      name = rawName = list[i].name; // attr key (id)
      value = list[i].value; // attr val (app)

      if (dirRE.test(name)) {
        // 有@,#事件時觸發
      } else {
        addAttr(el, name, JSON.stringify(value), list[i]);
      }
    }
  }
}

/**
 * {name:id, value:app} => {id:app}
 */
function makeAttrsMap(attrs: Array<Record<string, any>>): Record<string, any> {
  const map: any = {};
  for (let i = 0, l = attrs.length; i < l; i++) {
    map[attrs[i].name] = attrs[i].value;
  }
  return map;
}
