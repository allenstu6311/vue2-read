import { extend, noop } from "../core/shared/util.js";
import { baseWarn } from "./helpers.js";
import { CompilerOptions } from "../types/compiler.js";
import { Component } from "../types/component.js";

type CompiledFunctionResult = {
  render: Function;
  staticRenderFns: Array<Function>;
};

/**
 * 創造render function
 */
function createFunction(code: any, errors: any) {
  try {
    return new Function(code);
  } catch (err: any) {
    errors.push({ err, code });
    return noop;
  }
}

export function createCompileToFunctionFn(compile: Function): Function {
  const cache = Object.create(null);

  return function compileToFunctions(
    template: string,
    options?: CompilerOptions,
    vm?: Component
  ): CompiledFunctionResult {
    options = extend({}, options);
    const warn = options.warn || baseWarn;
    delete options.warn;

    // check cache
    const key = options.delimiters
      ? String(options.delimiters) + template
      : template;

    if (cache[key]) {
      return cache[key];
    }

    // compile
    const compiled = compile(template, options);

    const res: any = {};
    const fnGenErrors: any[] = [];
    res.render = createFunction(compiled.render, fnGenErrors);
    res.staticRenderFns = compiled.staticRenderFns.map((code: any) => {
      return createFunction(code, fnGenErrors);
    });

    return (cache[key] = res);
  };
}
