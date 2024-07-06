import { DebuggerOptions } from "../../v3";

export interface DepTarget extends DebuggerOptions {
    id: number
    addDep(dep: Dep): void
    update(): void
}

export default class Dep {
    
}