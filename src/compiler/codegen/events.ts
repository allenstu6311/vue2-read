import { ASTElementHandler, ASTElementHandlers } from "../../types/compiler.js";

/**
 * 判斷是否為一般方法名稱
 * 事件可能內容:
 * 1.@click="test" O
 * 2.@clik="test++" X
 * 3.@click="test()" X
 */
const simplePathRE =
  /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*|\['[^']*?']|\["[^"]*?"]|\[\d+]|\[[A-Za-z_$][\w$]*])*$/;

/**
 * @click="()=> 1 + 1"
 */
const fnExpRE = /^([\w$_]+|\([^)]*?\))\s*=>|^function(?:\s+[\w$]+)?\s*\(/;

/**
 * test() => test
 */
const fnInvokeRE = /\([^)]*?\);*$/;

/**
 * 合成事件處理
 */
export function genHandlers(
  events: ASTElementHandlers,
  isNative: boolean //原生事件 onclick,onchange...
): string {
  const prefix = isNative ? "nativeOn:" : "on:";
  let staticHandlers = ``;
  let dynamicHandlers = ``;

  for (const name in events) {
    const handlerCode = genHandler(events[name]);
    //@ts-expect-error
    if (events[name] && events[name].dymanic) {
    } else {
      staticHandlers += `"${name}":${handlerCode},`;
    }
    staticHandlers = `{${staticHandlers.slice(0, -1)}}`;
  }
  return prefix + staticHandlers;
}

function genHandler(
  handler: ASTElementHandler | Array<ASTElementHandler>
): string {
  if (!handler) return "function(){}";
  if (Array.isArray(handler)) return `[]`;

  const isMethodPath = simplePathRE.test(handler.value);
  const isFunctionExpression = fnExpRE.test(handler.value);
  const isFunctionInvocation = simplePathRE.test(
    handler.value.replace(fnInvokeRE, "")
  );

  if (!handler.modifiers) {
    if (isMethodPath || isFunctionExpression) return handler.value;
    return `function($event){${
      isFunctionInvocation ? `return ${handler.value}` : handler.value
    }}`;
  }

  return "";
}
