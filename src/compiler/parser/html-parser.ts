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
const startTagOpen = new RegExp(`^<${qnameCapture}`);
// console.log('startTagOpen',startTagOpen)
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
 * 忽略第一行
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
 * 取出標籤中attr的部分
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
    unary: boolean,
    start: number,
    end: number
  ) => void;
  end?: (tag: string, start: number, end: number) => void;
  chars?: (text: string, start?: number, end?: number) => void;
  comment?: (content: string, start: number, end: number) => void;
}
export function parseHTML(html: any, options: HTMLParserOptions) {
  // console.log('parseHTML', html)
  const stack: any[] = [];
  const expectHTML = options.expectHTML;
  const isUnaryTag = options.isUnaryTag || no; // 在baseOptions
  const canBeLeftOpenTag = options.canBeLeftOpenTag || no; //在baseOptions
  let index = 0; // 目前移動到的字串索引
  let last, lastTag: any;

  while (html) {
    last = html;

    //確保不再script && style標籤當中
    if (!lastTag || !isPlainTextElement(lastTag)) {
      let textEnd = html.indexOf("<");
      if (textEnd === 0) {
        if (comment.test(html)) {
          const commentEnd = html.indexOf("-->");
          // 有註解時觸發
          if (commentEnd >= 0) {
            // if (options.shouldKeepComment && options.comment) {}
            continue;
          }
        }

        const endTagMatch = html.match(endTag);
        // console.log('endTagMatch',endTagMatch)
        if (endTagMatch) {
          const curIndex = index;
          advance(endTagMatch[0].length);
          parseEndTag(endTagMatch[1], curIndex, index);
          continue;
        }

        // start tag
        const startTagMatch = parseStartTag();
        if (startTagMatch) {
          handleStartTag(startTagMatch);
          if (shouldIgnoreFirstNewline(startTagMatch.tagName, html)) {
            advance(1);
          }
          continue;
        }
      }

      let text, rest, next;
      if (textEnd >= 0) {
        rest = html.slice(textEnd);

        while (
          !endTag.test(rest) &&
          !startTagOpen.test(rest) &&
          !comment.test(rest) &&
          !conditionalComment.test(rest)
        ) {
          // 查找首次出現的位置
          next = rest.indexOf("<", 1);
          if (next < 0) break;
          rest = html.slice(textEnd);
        }
        text = html.substring(0, textEnd);
      }

      if (textEnd < 0) {
      }

      //跨果
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

  /**
   * 移動擷取位置 p> ---> </p
   */
  function advance(n: any) {
    index += n;
    html = html.substring(n);
  }

  /**
   * 解析開始的tag<p>
   */
  function parseStartTag() {
    // console.log('html', html)
    const start = html.match(startTagOpen);
    // console.log('parseStartTag', start)
    if (start) {
      const match: any = {
        tagName: start[1],
        attrs: [],
        start: index,
      };

      advance(start[0].length);
      let end, attr;

      // 如果end跟attr都沒有被賦值就停止迴圈
      while (
        !(end = html.match(startTagClose)) &&
        (attr = html.match(dynamicArgAttribute) || html.match(attribute))
      ) {
        attr.start = index;
        advance(attr[0].length);
        attr.end = index;
        match.attrs.push(attr);
      }

      if (end) {
        match.unarySlash = end[1]; // => ""
        advance(end[0].length);
        match.end = index;
        return match;
      }
    }
  }

  /**
   *
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
    // console.log('unary',unary)
    const l = match.attrs.length;
    const attrs: ASTAttr[] = new Array(l);

    for (let i = 0; i < l; i++) {
      const args = match.attrs[i];
      const value = args[3] || args[4] || args[5] || "";
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
      stack.push({
        tag: tagName,
        lowerCasedTag: tagName.toLowerCase(), //小寫標籤
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
    let pos, lowerCasedTagName;
    if (start === null) start = index;
    if (end === null) end = index;

    if (tagName) {
      lowerCasedTagName = tagName.toLowerCase();
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
