import { createCompiler } from "./../../../compiler/index.js";
import { baseOptions } from "./options.js";


const { compile, compileToFunctions } = createCompiler(baseOptions);
export { compile, compileToFunctions };
