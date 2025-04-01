import { ASTElement, ASTModifiers } from "../../types/compiler.js";

/**
 * 生成子層v-model
 */
export function genComponentModel(
  el: ASTElement,
  value: string,
  modifiers: ASTModifiers | null
): void {
  const { number, trim } = modifiers || {};
  const baseValueExpression = "$$v";
  let valueExpression = baseValueExpression;

  const assignment = genAssignmentCode(value, valueExpression);
  el.model = {
    value: `(${value})`,
    expression: JSON.stringify(value),
    callback: `function (${baseValueExpression}) {${assignment}}`,
  };
}

/**
 *
 * @param value v-model key
 * @param assigment "$event.target.value
 * @returns
 */
export function genAssignmentCode(value: string, assigment: string): string {
  const res = parseModel(value);

  if (res.key === null) {
    return `${value}=${assigment}`;
  }

  return "";
}

/**
 * 將 v-model 表達式解析為基礎路徑和最終的鍵段。
 * 支援處理點語法路徑以及可能的方括號結構。
 *
 * 常見的情況包括：
 *
 * - test                // 單一變量
 * - test[key]           // 對象鍵
 * - test[test1[key]]    // 嵌套的對象鍵
 * - test["a"][key]      // 字符串鍵與變量鍵的組合
 * - xxx.test[a[a].test1[key]]  // 更複雜的嵌套鍵
 * - test.xxx.a["asa"][test1[key]]  // 各種嵌套與鍵的混合
 *
 * 使用的變數說明：
 *
 * - len: 當前表達式的長度
 * - str: 當前正在處理的表達式字符串
 * - chr: 當前處理的單個字符
 * - index: 當前處理的字符串索引位置
 * - expressionPos: 表達式開始的位置（如方括號內）
 * - expressionEndPos: 表達式結束的位置
 */
let len: any,
  str: any,
  chr: any,
  index: any,
  expressionPos: any,
  expressionEndPos: any;

type ModelParseResult = {
  exp: string;
  key: string | null;
};

export function parseModel(val: string): ModelParseResult {
  val = val.trim();
  len = val.length;

  if (val.indexOf("[") < 0 || val.lastIndexOf("]") < len - 1) {
    index = val.lastIndexOf(".");
    if (index > -1) {
    } else {
      return {
        exp: val,
        key: null,
      };
    }
  }

  //   str = val;
  //   index = expressionPos = expressionEndPos = 0;

  //   while (!eof()) {
  //     chr = next();
  //   }

  //   return {
  //     exp: val.slice(0, expressionPos),
  //     key: val.slice(expressionPos + 1, expressionEndPos),
  //   };
  return val as any;
}

function next(): number {
  return str.charCodeAt(++index);
}

/**
 * end of file
 * @returns
 */
function eof(): boolean {
  return index >= len;
}
