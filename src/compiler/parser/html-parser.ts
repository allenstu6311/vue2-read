// @ts-nocheck
import { makeMap, no } from "../../core/shared/util.js";
import { unicodeRegExp } from "../../core/util/lang.js";
import { isNonPhrasingTag } from "../../platforms/web/compiler/utils.js";
import { ASTAttr, CompilerOptions } from "../../types/compiler.js";

//用於解析標籤和屬性的正規表示式
const attribute =
  /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
const dynamicArgAttribute =
  /^\s*((?:v-[\w-]+:|@|:|#)\[[^=]+?\][^\s"'<>\/=]*)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z${unicodeRegExp.source}]*`;
// console.log('ncname',ncname)
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
const startTagOpen = new RegExp(`^<${qnameCapture}`); //取的開始標籤內容
const startTagClose = /^\s*(\/?)>/;
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`);
const doctype = /^<!DOCTYPE [^>]+>/i;
// #7298: escape - to avoid being passed as HTML comment when inlined in page
const comment = /^<!\--/;
const conditionalComment = /^<!\[/;
const __DEV__ = false;

/**
 * 忽略換行標籤
 */
const isIgnoreNewlineTag = makeMap("pre,textarea", true);

/**
 * 忽略第一行跟換行標籤
 */
const shouldIgnoreFirstNewline = (tag: any, html: any) =>
  tag && isIgnoreNewlineTag(tag) && html[0] === "\n";

const decodingMap: any = {
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&amp;": "&",
  "&#10;": "\n",
  "&#9;": "\t",
  "&#39;": "'",
};
const encodedAttr = /&(?:lt|gt|quot|amp|#39);/g;
const encodedAttrWithNewLines = /&(?:lt|gt|quot|amp|#39|#10|#9);/g;

/**
 * 匹配後產生的html內容
 */
type matchPattern = {
  0: string; // "start:<div || end: </h1>"
  1: string; // "h1"
  groups: any;
  index: number;
  input: string;
};

/**
 * 解析標籤結構
 */
type tagPattern = {
  attts: any[];
  tagName: string;
  start?: number;
  end?: number;
  unarySlash: string; //檢查是否為一元標籤
};

/**
 * 取出標籤中attr的值
 * @returns id="app" => app
 */
function decodeAttr(value: any, shouldDecodeNewlines: any) {
  const re = shouldDecodeNewlines ? encodedAttrWithNewLines : encodedAttr;
  return value.replace((re: any, match: any) => decodingMap[match]);
}

export const isPlainTextElement = makeMap("script,style,textarea", true);

export interface HTMLParserOptions extends CompilerOptions {
  start?: (
    tag: string,
    attrs: ASTAttr[],
    /**
     * <h1/>
     */
    unary: boolean,
    start: number,
    end: number
  ) => void;
  end?: (tag: string, start: number, end: number) => void;
  chars?: (text: string, start?: number, end?: number) => void;
  comment?: (content: string, start: number, end: number) => void;
}
export function parseHTML(html: any, options: HTMLParserOptions) {
  const stack: any[] = []; //紀錄沒有結尾的標籤
  const expectHTML = options.expectHTML;
  const isUnaryTag = options.isUnaryTag || no; // 在baseOptions
  const canBeLeftOpenTag = options.canBeLeftOpenTag || no; //在baseOptions
  let index = 0; // 目前移動到的字串索引
  let last, lastTag: any;

  while (html) {
    last = html; //<div id=\"app\">\n      <h1 class=\"test\">{{test}}</h1>\n    </div>
    // console.log("html", html);
    //確保不再script && style標籤當中
    if (!lastTag || !isPlainTextElement(lastTag)) {
      let textEnd = html.indexOf("<");

      // console.log("textEnd", textEnd);
      if (textEnd === 0) {
        if (comment.test(html)) {
          const commentEnd = html.indexOf("-->");

          // 有註解時觸發
          if (commentEnd >= 0) {
            // if (options.shouldKeepComment && options.comment) {}
            advance(commentEnd + 3);
            continue;
          }
        }

        // end tag
        const endTagMatch: matchPattern = html.match(endTag);
        if (endTagMatch) {
          const curIndex = index;
          advance(endTagMatch[0].length);
          parseEndTag(endTagMatch[1], curIndex, index);
          continue;
        }

        // start tag
        const startTagMatch: tagPattern = parseStartTag();
        // console.log(startTagMatch);
        if (startTagMatch) {
          handleStartTag(startTagMatch);
          if (shouldIgnoreFirstNewline(startTagMatch.tagName, html)) advance(1);
          continue;
        }
      }

      let text, rest, next;
      // console.log("text", text);
      if (textEnd >= 0) {
        rest = html.slice(textEnd);

        // 只有純文本會進來
        while (
          !endTag.test(rest) && // 不是結束標籤
          !startTagOpen.test(rest) && // 不是開始標籤
          !comment.test(rest) && // 不是註釋
          !conditionalComment.test(rest) // 不是條件註釋
        ) {
          next = rest.indexOf("<", 1); // 找到下一個 "<" 的位置，從索引 1 開始找
          if (next < 0) break; // 如果沒有找到 "<"，跳出循環
          textEnd += next; // 更新文本結束的位置
          rest = html.slice(textEnd); // 更新 `rest`，表示剩餘待解析的字符串
        }
        text = html.substring(0, textEnd);
      }

      if (textEnd < 0) {
      }

      if (text) {
        advance(text.length);
      }

      // 處理標籤中間的文字
      if (options.chars && text) {
        options.chars(text, index - text.length, index);
      }
    }

    if (html === last) {
      options.chars && options.chars(html);
      break;
    }
  }
  //清理所有剩餘標籤
  parseEndTag();

  /**
   * 移動擷取位置 p> ---> </p
   */
  function advance(n: any) {
    index += n;
    html = html.substring(n);
  }

  /**
   * 解析開始的tag<p>
   * @returns match
   */
  function parseStartTag() {
    // console.log('html', html)
    const start: matchPattern = html.match(startTagOpen);

    if (start) {
      const match: any = {
        tagName: start[1],
        attrs: [], // 當前標籤內容
        start: index,
      };
      // console.log("start", start);
      advance(start[0].length);
      let end: matchPattern, attr: matchPattern;

      // 取得attr內容及結尾標籤">"
      while (
        !(end = html.match(startTagClose)) && //找尋結束標籤">"
        (attr = html.match(dynamicArgAttribute) || html.match(attribute))
      ) {
        attr.start = index;
        advance(attr[0].length); //取得下一個attr
        attr.end = index;
        match.attrs.push(attr);
      }

      //處理">"
      if (end) {
        match.unarySlash = end[1];
        advance(end[0].length);
        match.end = index;
        return match;
      }
    }
  }

  /**
   * 處理標籤中的attr
   */
  function handleStartTag(match: any) {
    const tagName = match.tagName;
    const unarySlash = match.unarySlash;
    // console.log('isNonPhrasingTag',isNonPhrasingTag)
    if (expectHTML) {
      // if(lastTag === 'p' && isNonPhrasingTag(lastTag)){
      // }
    }

    const unary = isUnaryTag(tagName) || !!unarySlash;
    const l = match.attrs.length;
    const attrs: ASTAttr[] = new Array(l);

    for (let i = 0; i < l; i++) {
      const args = match.attrs[i];
      const value = args[3] || args[4] || args[5] || "";
      // console.log("args", args);
      const shouldDecodeNewlines =
        tagName === "a" && args[1] === "href"
          ? options.shouldDecodeNewlinesForHref
          : options.shouldDecodeNewlines;

      //每一個標籤對象
      attrs[i] = {
        name: args[1],
        value: decodeAttr(value, shouldDecodeNewlines),
      };
    }
    if (!unary) {
      //記錄所有沒有結尾的標籤
      stack.push({
        tag: tagName,
        lowerCasedTag: tagName.toLowerCase(), //小寫標籤(之後比對end標籤用)
        attrs: attrs,
        start: match.start,
        end: match.end,
      });
      lastTag = tagName;
    }
    if (options.start) {
      options.start(tagName, attrs, unary, match.start, match.end);
    }
  }

  /**
   * 解析結束的標籤</p>
   */
  function parseEndTag(tagName?: any, start?: any, end?: any) {
    let pos;
    let lowerCasedTagName;
    if (start === null) start = index;
    if (end === null) end = index;

    if (tagName) {
      lowerCasedTagName = tagName.toLowerCase();
      // 沒有結尾標籤則跳過
      for (pos = stack.length - 1; pos >= 0; pos--) {
        if (stack[pos].lowerCasedTag === lowerCasedTagName) {
          break;
        }
      }
    } else {
      //如果未提供標籤名稱，則清理
      pos = 0;
    }

    if (pos >= 0) {
      // 關閉所有打開的元素，向上堆疊
      for (let i = stack.length - 1; i >= pos; i--) {
        if (options.end) {
          options.end(stack[i].tag, start, end);
        }
      }
      // 從堆疊中刪除打開的元素
      stack.length = pos;
      lastTag = pos && stack[pos - 1].tag;
    }
  }
}
