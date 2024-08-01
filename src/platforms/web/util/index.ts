/**
 * 檢查有無此el
 */
export function query(el: string | Element): Element {
  if (typeof el === "string") {
    const selected = document.querySelector(el);
    if (!selected) {
      console.warn("Cannot find element: " + el);
      return document.createElement("div");
    }
    return selected;
  }
  return el;
}
