import { baseWarn, pluckModuleFunction } from "../../../../compiler/helpers.js";
import { extend, no } from "../../../../core/shared/util.js";
import {
  ASTDirective,
  ASTElement,
  CompiledResult,
  CompilerOptions,
} from "../../../../types/compiler.js";
import baseDirective from "../directives/index.js";

type TransformFunction = (el: ASTElement, code: string) => string;
type DataGenFunction = (el: ASTElement) => string;
type DirectiveFunction = (
  el: ASTElement,
  dir: ASTDirective,
  warn: Function
) => boolean;

/**
 * 將AST轉換成渲染函數
 */
export class CodegenState {
  options: CompilerOptions;
  warn: Function;
  transforms: Array<TransformFunction>;
  dataGenFns: Array<DataGenFunction>;
  directives: { [key: string]: DirectiveFunction };
  maybeComponent: (el: ASTElement) => boolean;
  onceId: number;
  staticRenderFns: Array<string>;
  pre: boolean;

  constructor(options: CompilerOptions) {
    this.options = options;
    this.warn = options.warn || baseWarn;
    this.transforms = pluckModuleFunction(options.modules, "transformCode");
    this.dataGenFns = pluckModuleFunction(options.modules, "genData");
    this.directives = extend(extend({}, baseDirective), options.directives);
    const isReservedTag = options.isReservedTag || no;
    this.maybeComponent = (el: ASTElement) =>
      !!el.component || !isReservedTag(el.tag);
    this.onceId = 0;
    this.staticRenderFns = [];
    this.pre = false;
  }
}

export type CodegenResult = {
  render: string;
  staticRenderFns: Array<string>;
};

export function generate(
  ast: ASTElement | void,
  options: CompilerOptions
): CodegenResult {
  const state = new CodegenState(options);

  const code = ast
    ? ast.tag === "script"
      ? "null"
      : genElement(ast, state)
    : '_c("div")';

  return null as any;
}

export function genElement(el: ASTElement, state: CodegenState): string {
  console.log("el", el);
  let code;

  let data;
  const maybeComponent = state.maybeComponent(el);
  if (!el.plain || (el.pre && maybeComponent)) {
    data = genData(el, state);
  }

  return "";
}

function getStatic(el: ASTElement, state: CodegenState): string {
  el.staticProcessed = true;

  const originalPreState = state.pre;
  if (el.pre) {
    state.pre = el.pre;
  }

  state.staticRenderFns.push(`with(this){return ${genElement(el, state)}}`);
  state.pre = originalPreState;
  return `_m(${state.staticRenderFns.length - 1}${
    el.staticInFor ? ",true" : ""
  })`;
}

export function genData(el: ASTElement, state: CodegenState): string {
  let data = "{";
  const dirs = genDirectives(el, state);

  return data;
}

function genDirectives(el: ASTElement, state: CodegenState): string | void {
  const dirs = el.directives;
  // console.log("dirs", dirs);
}
