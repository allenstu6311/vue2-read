import platformModules from "./modules/index.js";
import * as nodeOps from "./node-ops.js";
import baseModules from "../../../core/vdom/modules/index.js";
import { createPatchFunction } from "../../../core/vdom/patch.js";

const modules = platformModules.concat(baseModules);
export const patch: Function = createPatchFunction({ nodeOps, modules });
