import { createCompiler } from "./../../../compiler/index.js";
import { baseOptions } from "./options.js";

// console.log("baseOptions", baseOptions);

const { compile, compileToFunctions } = createCompiler(baseOptions);

export { compile, compileToFunctions };
