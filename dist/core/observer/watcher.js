let uid = 0;
export default class Watcher {
    constructor() {
        this.id = ++uid;
    }
    addDep() { }
    update() { }
}
