const callbacks: Array<Function> = [];
let pending = false;

/**
 * 開始執行callback
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
   * 讓$nextTick可以使用.then
   */
  if (!cb && typeof Promise !== "undefined") {
    return new Promise((resolve) => {
      _resolve = resolve;
    });
  }
}
