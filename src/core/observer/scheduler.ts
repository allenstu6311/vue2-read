import { nextTick } from "../util/next-tick.js";
import Dep from "./dep.js";
import Watcher from "./watcher.js";

const queue: Array<Watcher> = []
let has: { [key: number]: true | undefined | null } = {}
let flushing = false;
let waiting = false;

export function queueWatcher(watcher: Watcher) {
    const id = watcher.id;
    if (has[id] != null) return;
    if (watcher === Dep.target && watcher.noRecurse) return;

    has[id] = true;

    if (!flushing) {
        queue.push(watcher);
    }

    // queue the flush
    if (!waiting) {
        waiting = true;
        watcher.run()
    }
}