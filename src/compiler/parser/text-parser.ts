import { cached } from "../../core/util/index.js";
import { parseFilters } from "./filter-parser.js";

const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; //獲取{{ }}中的內容
const regexEscapeRE = /[-.*+?^${}()|[\]\/\\]/g;

const buildRegex = cached((delimiters) => {
  const open = delimiters[0].replace(regexEscapeRE, "\\$&");
  const close = delimiters[1].replace(regexEscapeRE, "\\$&");
  return new RegExp(open + "((?:.|\\n)+?)" + close, "g");
});

type TextParseResult = {
  expression: string;
  tokens: Array<string | { "@binding": string }>;
};

/**
 * 取得{{test}}表達式
 */
export function parseText(
  text: string,
  delimiters?: [string, string]
): TextParseResult | void {
  //@ts-expect-error
  const tagRE = delimiters ? buildRegex(delimiters) : defaultTagRE;
  if (!tagRE.test(text)) return;

  const tokens: string[] = [];
  const rawTokens: any[] = [];

  let lastIndex = (tagRE.lastIndex = 0);
  let match, index, tokenValue;

  while ((match = tagRE.exec(text))) {
    // console.log("match", match);
    index = match.index; // [{{text}},text,{group:undeinfd},{index:0},{input:{{test}}}]
    // push text token
    if (index > lastIndex) {
      rawTokens.push((tokenValue = text.slice(lastIndex, index)));
      tokens.push(JSON.stringify(tokenValue));
    }

    //tag token
    const exp = parseFilters(match[1].trim());
    tokens.push(`_s(${exp})`);
    rawTokens.push({ "@binding": exp });
    lastIndex = index + match[0].length;
  }

  if (lastIndex < text.length) {
    rawTokens.push((tokenValue = text.slice(lastIndex)));
    tokens.push(JSON.stringify(tokenValue));
  }

  return {
    expression: tokens.join("+"),
    tokens: rawTokens,
  };
}
