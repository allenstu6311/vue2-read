import { generate } from "../platforms/web/compiler/codegen/index.js";
import { CompilerOptions } from "../types/compiler.js";
import { createCompilerCreator } from "./create-compiler.js";
import { parse } from "./parser/index.js";

const baseCompile = function (
  template: string,
  options: CompilerOptions //一開始的options + baseoptions
) {
  const ast = parse(template.trim(), options);

  // console.log("ast", ast);

  const code = generate(ast, options);

  return {
    ast,
    render: "",
    staticRenderFns: () => {},
  };
};

export const createCompiler = createCompilerCreator(baseCompile);
