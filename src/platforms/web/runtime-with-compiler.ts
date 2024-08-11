import { cached } from "../../core/util/index.js";
import { compileToFunctions } from "./compiler/index.js";
import { query } from "./util/index.js";

/**
 * 回傳html
 */
const idToTemplate = cached((id) => {
  const el = query(id);
  return el && el.innerHTML;
});

export function initMount(Vue: any) {
  let mount: any = Vue.prototype.$mount;

  Vue.prototype.$mount = function (el?: string | Element, hydrating?: boolean) {
    const options = this.$options;
    // console.log("tt", options.render);
    el = el && query(el);
    if (!options.render) {
      let template = options.template;
      if (template) {
        if (typeof template === "string") {
          if (template.charAt(0) === "#") {
            template = idToTemplate(template);
          }
        } else if (template.nodeTpye) {
          template = template.innerHTML;
        } else {
          return this;
        }
      } else if (el) {
        // console.log(el);
        // @ts-expect-error
        template = getOuterHTML(el);
      }
      // console.log("template", template);
      //取得模板後
      if (template) {
        const { render, staticRenderFns } = compileToFunctions(
          template,
          {
            outputSourceRange: true,
            shouldDecodeNewlines: false,
            shouldDecodeNewlinesForHref: false,
            delimiters: options.delimiters,
            comments: options.comments,
          },
          this
        );
        // console.log("render", render);
        // console.log("staticRenderFns", staticRenderFns);
        options.render = render
        options.staticRenderFns = staticRenderFns;
      }
    }

    return "";
  };
}

/**
 * 取得元素的outerHTML
 */
export function getOuterHTML(el: Element): string {
  if (el.outerHTML) {
    return el.outerHTML;
  }

  const container = document.createElement("div");
  container.appendChild(el.cloneNode(true));
  return container.innerHTML;
}
