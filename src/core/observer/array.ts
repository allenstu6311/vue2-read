// @ts-nocheck
import { def } from "../util/index.js";

const arrayProto: any = Array.prototype;
export const arrayMethods = Object.create(arrayProto);

const methodsToPatch = [
    'push',
    'pop',
    'shift',
    'unshift',
    'splice',
    'sort',
    'reverse'
];

/**
 * 攔截陣列方法
 */
methodsToPatch.forEach(method => {
    const original = arrayProto[method];
    // console.log('method',method);

    
    def(arrayMethods, method, function mutator(...args) {// args => data
        const result = original.apply(this, args);

        console.log('args',args);
        const ob = this.__ob__;
        /**
         * 被加入陣列的資料
         */
        let inserted;
        switch (method) {
            case 'push':
            case 'unshift':
                inserted = args;
                break;
            case 'splice':
                inserted = args.slice(2);
                break;
        }

        if(inserted) ob.observeArray(inserted);
        ob.dep.notify();
        return result;
    })
})