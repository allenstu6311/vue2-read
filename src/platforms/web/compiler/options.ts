import { CompilerOptions } from "../../../types/compiler.js";
import modules from "./modules/index.js";


export const baseOptions: CompilerOptions = {
  expectHTML: true,
  modules,
};
