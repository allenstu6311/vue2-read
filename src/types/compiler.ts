import { BindingMetadata } from "../../package/compiler-sfc/src/type";

export type CompilerOptions = {
  warn?: Function; // allow customizing warning in different environments; e.g. node
  modules?: Array<ModuleOptions>; // platform specific modules; e.g. style; class
  directives?: { [key: string]: Function }; // platform specific directives
  staticKeys?: string; // a list of AST properties to be considered static; for optimization
  isUnaryTag?: (tag: string) => boolean | undefined; // 檢查是否為一元 <p class="test" />
  canBeLeftOpenTag?: (tag: string) => boolean | undefined; // check if a tag can be left opened
  /**
   * 檢查標籤是否為平台原生
   * @param tag
   * @returns
   */
  isReservedTag?: (tag: string) => boolean | undefined;
  /**
   * 保留元素之間的空白
   */
  preserveWhitespace?: boolean; // preserve whitespace between elements? (Deprecated)
  whitespace?: "preserve" | "condense"; // whitespace handling strategy
  optimize?: boolean; // optimize static content?

  // web specific
  mustUseProp?: (tag: string, type: string | null, name: string) => boolean; // check if an attribute should be bound as a property
  isPreTag?: (attr: string) => boolean | null; // check if a tag needs to preserve whitespace
  getTagNamespace?: (tag: string) => string | undefined; // check the namespace for a tag
  expectHTML?: boolean; // 僅對於非 Web 建置為 false
  isFromDOM?: boolean;
  shouldDecodeTags?: boolean; // 需要解碼標籤
  shouldDecodeNewlines?: boolean; // 需要解碼換行符號
  shouldDecodeNewlinesForHref?: boolean;
  outputSourceRange?: boolean;
  shouldKeepComment?: boolean;

  // runtime user-configurable
  delimiters?: [string, string]; // template delimiters
  comments?: boolean; // preserve comments in template

  // for ssr optimization compiler
  scopeId?: string;

  // SFC analyzed script bindings from `compileScript()`
  bindings?: BindingMetadata;
};

export type WarningMessage = {
  msg: string;
  start?: number;
  end?: number;
};

export type CompiledResult = {
  ast: ASTElement | null;
  render: string;
  staticRenderFns: Array<string>;
  stringRenderFns?: Array<string>;
  errors?: Array<string | WarningMessage>;
  tips?: Array<string | WarningMessage>;
};

export type ModuleOptions = {
  // transform an AST node before any attributes are processed
  // returning an ASTElement from pre/transforms replaces the element
  preTransformNode?: (el: ASTElement) => ASTElement | null | void;
  // transform an AST node after built-ins like v-if, v-for are processed
  transformNode?: (el: ASTElement) => ASTElement | null | void;
  // transform an AST node after its children have been processed
  // cannot return replacement in postTransform because tree is already finalized
  postTransformNode?: (el: ASTElement) => void;
  genData?: (el: ASTElement) => string; // generate extra data string for an element
  transformCode?: (el: ASTElement, code: string) => string; // further transform generated code for an element
  staticKeys?: Array<string>; // AST properties to be considered static
};

/**
 * 事件屬性(once,stop...)
 */
export type ASTModifiers = { [key: string]: boolean };

/**
 * v-if v-else-if v-else
 */
export type ASTIfCondition = {
  exp: string | null; // 指令
  block: ASTElement; //模塊
};
export type ASTIfConditions = Array<ASTIfCondition>;

/**
 * el.ttrsList
 */
export type ASTAttr = {
  /**
   * attr key
   */
  name: string;
  /**
   * arrt value
   */
  value: any;
  dynamic?: boolean;
  start?: number;
  end?: number;
};

export type ASTElementHandler = {
  value: string;
  params?: Array<any>;
  modifiers: ASTModifiers | null;
  dynamic?: boolean;
  start?: number;
  end?: number;
};

export type ASTElementHandlers = {
  [key: string]: ASTElementHandler | Array<ASTElementHandler>;
};

export type ASTDirective = {
  name: string;
  rawName: string;
  value: string;
  arg: string | null;
  isDynamicArg: boolean;
  modifiers: ASTModifiers | null;
  start?: number;
  end?: number;
};

export type ASTNode = ASTElement | ASTText | ASTExpression;

/**
 * Vue 抽象樹
 */
export type ASTElement = {
  /**
   * 1:元素節點(HTML標籤),例:<div>
   * 2:表達式節點,例:{{test}}
   * 3:純文本節點
   */
  type: 1;
  tag: string;
  attrsList: Array<ASTAttr>;
  attrsMap: { [key: string]: any };
  rawAttrsMap: { [key: string]: ASTAttr };
  parent: ASTElement | void;
  children: Array<ASTNode>;

  start?: number;
  end?: number;

  processed?: true;

  static?: boolean;
  staticRoot?: boolean;
  staticInFor?: boolean;
  staticProcessed?: boolean;
  hasBindings?: boolean;

  text?: string;
  attrs?: Array<ASTAttr>;
  dynamicAttrs?: Array<ASTAttr>;
  props?: Array<ASTAttr>;
  /**
   * 是否為普通元素(不需處理的元素)
   */
  plain?: boolean;
  pre?: true;
  ns?: string;

  component?: string;
  inlineTemplate?: true;
  transitionMode?: string | null;
  slotName?: string | null;
  slotTarget?: string | null;
  slotTargetDynamic?: boolean;
  slotScope?: string | null;
  scopedSlots?: { [name: string]: ASTElement };

  ref?: string;
  refInFor?: boolean;

  if?: string;
  ifProcessed?: boolean;
  elseif?: string;
  else?: true;
  ifConditions?: ASTIfConditions;

  for?: string;
  forProcessed?: boolean;
  key?: string;
  alias?: string;
  iterator1?: string;
  iterator2?: string;

  staticClass?: string;
  classBinding?: string;
  staticStyle?: string;
  styleBinding?: string;
  events?: ASTElementHandlers;
  nativeEvents?: ASTElementHandlers;

  transition?: string | true;
  transitionOnAppear?: boolean;

  model?: {
    value: string;
    callback: string;
    expression: string;
  };

  directives?: Array<ASTDirective>;

  forbidden?: true;
  once?: true;
  onceProcessed?: boolean;
  wrapData?: (code: string) => string;
  wrapListeners?: (code: string) => string;

  // 2.4 ssr optimization
  ssrOptimizability?: number;
};

export type ASTExpression = {
  type: 2;
  expression: string;
  text: string;
  tokens: Array<string | Object>;
  static?: boolean;
  // 2.4 ssr optimization
  ssrOptimizability?: number;
  start?: number;
  end?: number;
};

export type ASTText = {
  type: 3;
  text: string;
  static?: boolean;
  /**
   * 是否為註解
   */
  isComment?: boolean;
  // 2.4 ssr optimization
  ssrOptimizability?: number;
  start?: number;
  end?: number;
};
