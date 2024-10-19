import { baseWarn, pluckModuleFunction } from "../helpers.js";
import { extend, no } from "../../core/shared/util.js";
import {
  ASTAttr,
  ASTDirective,
  ASTElement,
  ASTExpression,
  ASTNode,
  ASTText,
  CompiledResult,
  CompilerOptions,
} from "../../types/compiler.js";
import baseDirective from "../directives/index.js";
import { genHandlers } from "./events.js";

type TransformFunction = (el: ASTElement, code: string) => string;
type DataGenFunction = (el: ASTElement) => string;
type DirectiveFunction = (
  el: ASTElement,
  dir: ASTDirective,
  warn?: Function
) => boolean;

/**
 * 將AST轉換成渲染函數
 */
export class CodegenState {
  options: CompilerOptions;
  warn: Function;
  transforms: Array<TransformFunction>;
  dataGenFns: Array<DataGenFunction>;
  directives: { [key: string]: DirectiveFunction };
  maybeComponent: (el: ASTElement) => boolean;
  onceId: number;
  staticRenderFns: Array<string>;
  pre: boolean;

  constructor(options: CompilerOptions) {
    this.options = options;
    this.warn = options.warn || baseWarn;
    this.transforms = pluckModuleFunction(options.modules, "transformCode");
    this.dataGenFns = pluckModuleFunction(options.modules, "genData"); //class生成函數
    this.directives = extend(extend({}, baseDirective), options.directives);
    const isReservedTag = options.isReservedTag || no;
    this.maybeComponent = (el: ASTElement) =>
      !!el.component || !isReservedTag(el.tag);
    this.onceId = 0;
    this.staticRenderFns = [];
    this.pre = false;
  }
}

export type CodegenResult = {
  render: string;
  staticRenderFns: Array<string>;
};

/**
 * 生成渲染函數的code
 */
export function generate(
  ast: ASTElement | void,
  options: CompilerOptions
): CodegenResult {
  const state = new CodegenState(options);

  const code = () => {
    if (!ast) return '_c("div")';
    if (ast.tag === "script") return "null";
    return genElement(ast, state);
  };

  return {
    render: `with(this){return ${code()}}`,
    staticRenderFns: state.staticRenderFns,
  };
}

export function genElement(el: ASTElement, state: CodegenState): string {
  if (el.parent) {
    el.pre = el.pre || el.parent.pre;
  }

  if (el.for && !el.forProcessed) {
    return genFor(el, state);
  } else {
    let code;
    let data;
    const maybeComponent = state.maybeComponent(el);
    //是否為不需要處理的元素或component or pre
    if (!el.plain || (el.pre && maybeComponent)) {
      data = genData(el, state);
    }

    let tag: string | undefined;
    if (!tag) tag = `'${el.tag}'`;

    const children = el.inlineTemplate ? null : genChildren(el, state, true);

    let chidContent = children ? `,${children}` : "";

    code = `_c(${tag}${data ? `,${data}` : ""}${
      children ? `,${children}` : ""
    })`;

    for (let i = 0; i < state.transforms.length; i++) {
      code = state.transforms[i](el, code);
    }
    return code; //_c('p',{staticClass:"h1"})
  }
}

export function genFor(
  el: any,
  state: CodegenState,
  altGen?: Function,
  altHelper?: string
) {
  const exp = el.for;
  const alias = el.alias;
  const iterator1 = el.iterator1 ? `,${el.iterator1}` : "";
  const iterator2 = el.iterator2 ? `,${el.iterator2}` : "";

  el.forProcessed = true; // avoid recursion

  return (
    `${altHelper || "_l"}((${exp}),` +
    `function(${alias}${iterator1}${iterator2}){` +
    `return ${(altGen || genElement)(el, state)}` +
    `})`
  );
}

/**
 * 生成標籤中attr元素
 * @returns '{attrs:{"id":"app"}}'
 */
export function genData(el: ASTElement, state: CodegenState): string {
  let data = "{";
  const dirs = genDirectives(el, state);
  if (dirs) data += dirs + ",";

  //:key
  if (el.key) {
    data += `key:${el.key}`;
  }

  // compiler/class.ts genData(生成staticClass)
  for (let i = 0; i < state.dataGenFns.length; i++) {
    data += state.dataGenFns[i](el);
  }

  if (el.attrs) {
    data += `attrs:${genProps(el.attrs)},`;
  }

  // DOM props
  if (el.props) {
    data += `domProps:${genProps(el.props)},`;
  }

  // event handlers
  if (el.events) {
    data += `${genHandlers(el.events, false)},`;
  }

  data = data.replace(/,$/, "") + "}";
  return data; //attrs:{"id":"app"}}
}

/**
 * 合成子層表達式
 * @returns '[ _c('p',{staticClass:"h1"},[_v(_s(test))])]'
 */
export function genChildren(
  el: ASTElement,
  state: CodegenState,
  checkSkip?: boolean,
  altGenElement?: Function,
  altGenNode?: Function
): string | void {
  const children = el.children;
  if (children.length) {
    const el: any = children[0];

    if (
      children.length === 1 &&
      el.for &&
      el.tag !== "template" &&
      el.tag !== "slot"
    ) {
      const normalizationType = checkSkip
        ? state.maybeComponent(el)
          ? `,1`
          : `,0`
        : ``;
      return `${(altGenElement || genElement)(el, state)}${normalizationType}`;
    }

    //正規化類型
    const normalizationType = checkSkip
      ? getNormalizationType(children, state.maybeComponent)
      : 0;

    const gen = altGenNode || genNode;
    return `[${children.map((c) => gen(c, state)).join(",")}]${
      normalizationType ? `,${normalizationType}` : ""
    }`;
  }
}

function genNode(node: ASTNode, state: CodegenState): string {
  if (node.type === 1) {
    return genElement(node, state);
  } else if (node.type === 3 && node.isComment) {
    return "";
  }
  return genText(node);
}

/**
 * @returns [_v(_s(test))]
 */
export function genText(text: ASTExpression | ASTText | any): string {
  return `_v(${
    text.type === 2
      ? text.expression // 不需要 () 因為已經包裝在 _s() 中
      : transformSpecialNewlines(JSON.stringify(text.text))
  })`;
}

/**
 * 子節點是否需要規範化
 * 0:不須規範
 * 1:簡單規範(節點中包含數組)
 * 2:完全規範(v-for)
 */
function getNormalizationType(
  children: Array<ASTNode>,
  maybeComponent: (el: ASTElement) => boolean
): number {
  let res = 0;

  for (let i = 0; i < children.length; i++) {
    const el: ASTNode = children[i];
    if (el.type !== 1) continue;

    //模板中有v-for或tag為template || slot
    if (
      needsNormalization(el) ||
      (el.ifConditions &&
        el.ifConditions?.some((c) => needsNormalization(c.block)))
    ) {
      res = 2;
      break;
    }

    //模板中有v-if
    if (
      maybeComponent(el) ||
      (el.ifConditions && el.ifConditions.some((c) => maybeComponent(c.block)))
    ) {
      res = 1;
    }
  }
  return res;
}

/**
 * 正規化條件
 */
function needsNormalization(el: ASTElement): boolean {
  return el.for !== undefined || el.tag === "template" || el.tag === "slot";
}

// function getStatic(el: ASTElement, state: CodegenState): string {
//   el.staticProcessed = true;

//   const originalPreState = state.pre;
//   if (el.pre) {
//     state.pre = el.pre;
//   }

//   state.staticRenderFns.push(`with(this){return ${genElement(el, state)}}`);
//   state.pre = originalPreState;
//   return `_m(${state.staticRenderFns.length - 1}${el.staticInFor ? ",true" : ""
//     })`;
// }

function genDirectives(el: ASTElement, state: CodegenState): string | void {
  const dirs = el.directives;
  if (!dirs) return;

  let res = "directives:[";
  let hasRuntime = false;
  let dir, needRuntime;

  for (let i = 0; i < dirs.length; i++) {
    dir = dirs[i];
    needRuntime = true;
    const gen: DirectiveFunction =
      state.directives[dir.name /** model,html,test... */]; //(model,html,test) fn

    if (gen) {
      needRuntime = !!gen(el, dir, state.warn);
    }

    if (needRuntime) {
      hasRuntime = true;
      const name = `name: "${dir.name}",`;
      const rawName = `rawName: "${dir.rawName}"`;
      const value = dir.value
        ? `,value: (${dir.value}),expression: ${JSON.stringify(dir.value)}`
        : "";
      const arg = dir.arg
        ? `,arg: ${dir.isDynamicArg ? dir.arg : `"${dir.arg}"`}`
        : "";
      const modifiers = dir.modifiers
        ? `,modifiers: ${JSON.stringify(dir.modifiers)}`
        : "";

      res += `{
        ${name}
        ${rawName}
        ${value}
        ${arg}
        ${modifiers}
      },`;
      // res += `{name:"${dir.name}",rawName:"${dir.rawName}"${
      //   dir.value
      //     ? `,value:(${dir.value}),expression:${JSON.stringify(dir.value)}`
      //     : ""
      // }${dir.arg ? `,arg:${dir.isDynamicArg ? dir.arg : `"${dir.arg}"`}` : ""}${
      //   dir.modifiers ? `,modifiers:${JSON.stringify(dir.modifiers)}` : ""
      // }},`;
      // res += `{${name},${rawName}${value}${arg}${modifiers}},`;

      //directives:[{name:"model",rawName:"v-model",value:(test),expression:"test"},
    }
    if (hasRuntime) {
      return res.slice(0, -1) + "]";
    }
  }
}

/**
 * 組合attr的key,value
 * @returns '{"id":"app"}'
 */
function genProps(props: Array<ASTAttr>): string {
  let staticProps = ``;
  let dynamicProps = ``;

  for (let i = 0; i < props.length; i++) {
    const prop = props[i];
    const value = transformSpecialNewlines(prop.value); //"app"

    if (prop.dynamic) {
      dynamicProps += `${prop.name},${value},`;
    } else {
      staticProps += `"${prop.name}":${value},`; // "id":"app",
    }
  }
  staticProps = `{${staticProps.slice(0, -1)}}`; // {"id":"app"} (去掉最後的逗號)

  if (dynamicProps) {
    return `_d(${staticProps},[${dynamicProps.slice(0, 1)}])`;
  }

  return staticProps;
}

/**
 * 避免(\u2028,\u2029)出現意外的換行
 */
function transformSpecialNewlines(text: string): string {
  return text.replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}
