import { extend } from "../core/shared/util.js";
import { CompilerOptions } from "../types/compiler.js";
import { createCompileToFunctionFn } from "./to-function.js";

export function createCompilerCreator(baseCompile: Function): Function {
  return function createCompiler(baseOptions: CompilerOptions) {
    function compile(template: string, options?: CompilerOptions) {
      const finalOptions = Object.create(baseOptions);

      if (options) {
        // merge custom modules
        if (options.modules) {
          finalOptions.modules = (baseOptions.modules || []).concat(
            options.modules
          );
        }
        // merge custom directives
        if (options.directives) {
          finalOptions.directives = extend(
            Object.create(baseOptions.directives || null),
            options.directives
          );
        }

        // copy other options
        for (const key in options) {
          if (key !== "modules" && key !== "directives") {
            finalOptions[key] = options[key as keyof CompilerOptions];
          }
        }
      }

      const compiled = baseCompile(template.trim(), finalOptions);
      return compiled;
    }

    return {
      compile,
      compileToFunctions: createCompileToFunctionFn(compile),
    };
  };
}
