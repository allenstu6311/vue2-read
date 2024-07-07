let uid = 0;
const pendingCleanupDeps = [];
//管理依賴關係和通知依賴變化
export default class Dep {
    constructor() {
        this._pending = false; //用來標識當前是否有待清理的訂閱者
        this.id = uid++;
        this.subs = [];
    }
    //新增一個訂閱者
    addSub(sub) {
        this.subs.push(sub);
    }
    //移除一個訂閱者
    removeSub(sub) {
        //標記訂閱者為 null，延遲清理
        this.subs[this.subs.indexOf(sub)] = null;
        if (!this._pending) {
            this._pending = true;
            pendingCleanupDeps.push(this); //將目前 Dep 實例新增至待清理佇列中
        }
    }
    //收集依赖关系
    depend(info) {
        //如果 Dep.target 存在，表示目前有一個依賴需要被收集，就將目前 Dep 實例加入 Dep.target 的依賴中
        if (Dep.target) {
            Dep.target.addDep(this); //收集依賴
            if (info && Dep.target.onTrack) {
                Dep.target.onTrack(Object.assign({ effect: Dep.target }, info));
            }
        }
    }
    // 通知所有訂閱者數據變化
    notify(info) {
        const subs = this.subs.filter((s) => s);
        subs.sort((a, b) => a.id - b.id); //确保通知顺序
        const l = subs.length;
        for (let i = 0; i < l; i++) {
            const sub = subs[i];
            if (info) {
                sub.onTrigger &&
                    sub.onTrigger(Object.assign({ effect: subs[i] }, info));
            }
            sub.update();
        }
    }
}
Dep.target = null;
const targetStack = [];
