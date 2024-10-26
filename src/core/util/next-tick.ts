const callbacks: Array<Function> = [];
let pending = false;

/**
 * 開始執行nextTock回調
 */
function flushCallBacks() {
  pending = false;
  const copies = callbacks.slice(0);
  callbacks.length = 0;
  for (let i = 0; i < copies.length; i++) {
    copies[i]();
  }
}

const p = Promise.resolve();
// vue異步渲染關鍵
let timerFunc: Function = () => {  
  p.then(flushCallBacks);
};

/**
 * @internal
 */
export function nextTick(cb?: (...args: any[]) => any, ctx?: object) { 
  let _resolve: Function;
  
  callbacks.push(() => {
    if (cb) {
      try {
        cb.call(ctx);
      } catch (e: any) {}
    } else if (_resolve) {
      _resolve(ctx);
    }
  });
  
  if (!pending) {
    timerFunc();
  }
  /**
   * 如果未提供回調函數，返回一個 Promise，
   * 以便可以使用 $nextTick().then() 的形式來等待下一次 DOM 更新完成後執行操作。
   */
  if (!cb && typeof Promise !== "undefined") {
    return new Promise((resolve) => {
      _resolve = resolve;
    });
  }
}
