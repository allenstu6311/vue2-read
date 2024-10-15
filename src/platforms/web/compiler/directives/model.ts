import { genAssignmentCode } from "../../../../compiler/directives/model.js";
import { addProp } from "../../../../compiler/helpers.js";
import {
  ASTDirective,
  ASTElement,
  ASTModifiers,
} from "../../../../types/compiler.js";

let warn;

export const RANGE_TOKEN = "__r";
export const CHECKBOX_RADIO_TOKEN = "__c";

export default function model(
  el: ASTElement,
  dir: ASTDirective,
  _warn?: Function
): boolean | undefined {
  const value = dir.value;
  const modifiers = dir.modifiers; // .number | .trim

  const tag = el.tag;
  const type = el.attrsMap.type; // input type

  if (el.component) {
  } else if (tag === "input" || tag === "textarea") {
    genDefaultModel(el, value, modifiers);
  }

  // 確保運行時指令元數據
  return true;
}

function genDefaultModel(
  el: ASTElement,
  value: string, //v-model="test" => test
  modifiers?: ASTModifiers | null
): boolean | void {
  const type = el.attrsMap.type; // input type

  // const { lazy, number, trim } = modifiers || {};
  let valueExpression = "$event.target.value";

  let code = genAssignmentCode(value, valueExpression);

  addProp(el, "value", `(${value})`);
}
