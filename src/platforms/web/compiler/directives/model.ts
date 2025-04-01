import {
  genAssignmentCode,
  genComponentModel,
} from "../../../../compiler/directives/model.js";
import { addHandler, addProp } from "../../../../compiler/helpers.js";
import config from "../../../../core/config.js";
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
    // 表單處理
    genDefaultModel(el, value, modifiers);
  } else if (!config.isReservedTag(tag)) {
    // component
    genComponentModel(el, value, modifiers);
    return false; //元件 v-model 不需要額外的運行時間
  }

  // 確保運行時指令元數據
  return true;
}

function genDefaultModel(
  el: ASTElement,
  value: string, //v-model="test" => test
  modifiers?: ASTModifiers | null // v-model.number => number
): boolean | void {
  const type = el.attrsMap.type; // input type

  const { lazy, number, trim } = modifiers || {};
  const event = lazy ? "change" : type === "range" ? RANGE_TOKEN : "input";
  // const event = 'input';
  const needCompositionGuard = !lazy && type !== "range";

  let valueExpression = "$event.target.value";
  let code = genAssignmentCode(value, valueExpression); //test=$event.target.value

  if (needCompositionGuard) {
    code = `if($event.target.composing)return;${code}`;
  }

  addProp(el, "value", `(${value})`);
  addHandler(el, event, code, null, true);
}
