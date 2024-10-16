import { ASTDirective, ASTElement } from "../../types/compiler.js";

export default function on(el: ASTElement, dir: ASTDirective) {
  el.wrapListeners = (code: string) => `_g(${code},${dir.value})`;
}
