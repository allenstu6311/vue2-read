#執行 tsc -w 即可，使用根目錄的 index.html

觀察 createComponent

git reset --hard HEAD

導讀網站
https://vue.windliang.wang/posts/Vue2%E5%89%A5%E4%B8%9D%E6%8A%BD%E8%8C%A7-%E6%A8%A1%E7%89%88%E7%BC%96%E8%AF%91%E4%B9%8B%E7%94%9F%E6%88%90AST.html#start-%E5%87%BD%E6%95%B0

//菜單
依賴蒐集
cleanupDeps
mixin
vue.use()

//需理解項目

2.optimize single v-for
if (
children.length === 1 &&
el.for &&
el.tag !== 'template' &&
el.tag !== 'slot'
) {
const normalizationType = checkSkip
? state.maybeComponent(el)
? `,1`
: `,0`
: ``      return`${(altGenElement || genElement)(el, state)}${normalizationType}`
}
const normalizationType = checkSkip
? getNormalizationType(children, state.maybeComponent)
: 0

    console.log('children', children)

    console.log('normalizationType', normalizationType)

    const gen = altGenNode || genNode
    return `[${children.map(c => gen(c, state)).join(',')}]${
      normalizationType ? `,${normalizationType}` : ''
    }`

}
