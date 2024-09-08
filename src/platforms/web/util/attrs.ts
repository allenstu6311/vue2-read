import { makeMap } from "../../../core/util/index.js";


export const isBooleanAttr = makeMap(
    'allowfullscreen,async,autofocus,autoplay,checked,compact,controls,declare,' +
    'default,defaultchecked,defaultmuted,defaultselected,defer,disabled,' +
    'enabled,formnovalidate,hidden,indeterminate,inert,ismap,itemscope,loop,multiple,' +
    'muted,nohref,noresize,noshade,novalidate,nowrap,open,pauseonexit,readonly,' +
    'required,reversed,scoped,seamless,selected,sortable,' +
    'truespeed,typemustmatch,visible'
)

/**
 * 枚舉屬性
 */
export const isEnumeratedAttr = makeMap('contenteditable,draggable,spellcheck');


export const isXlink = (name: string): boolean => {
    return name.charAt(5) === ':' && name.slice(0, 5) === 'xlink'
}

/**
 * attr沒有賦直或無效
 */
export const isFalsyAttrValue = (val: any): boolean => {
    return val == null || val === false
}