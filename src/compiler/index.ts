import { generate } from "../platforms/web/compiler/codegen/index.js";
import { CompilerOptions } from "../types/compiler.js";
import { createCompilerCreator } from "./create-compiler.js";
import { parse } from "./parser/index.js";

const baseCompile = function (
  template: string,
  options: CompilerOptions //一開始的options + baseoptions
) {
  //生成AST樹
  const ast = parse(template.trim(), options);
  //生成表達函數
  const code = generate(ast, options);

  return {
    ast,
    render: code.render,
    staticRenderFns: code.staticRenderFns,
  };
};

export const createCompiler = createCompilerCreator(baseCompile);
