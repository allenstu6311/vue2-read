/**
 * 解析模板中的{{ XX }}
 */
export function parseFilters(exp: string): string {
  let inSingle = false; //是否在单引号字符串内部
  let inDouble = false; //是否在双引号字符串内部
  let inTemplateString = false; //是否在模板字符串内部。用于处理模板字符串（反引号）中的字符
  let inRegex = false; //是否在正则表达式内部
  let curly = 0;
  let square = 0;
  let paren = 0;
  let lastFilterIndex = 0; //记录上一个过滤器的索引位置

  return exp;
}
