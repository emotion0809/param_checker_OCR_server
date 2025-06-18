import { KvmTaskManeger } from "../class/kvm-task-maneger.class";
import { TaskQueManagerInPC } from "../class/task-manager.class";

export let mainState = {
    kvmTaskManeger: new KvmTaskManeger(),
    webSetIndex: 0,
    autoitProcessIndependencyGuard: new TaskQueManagerInPC('按鍵精靈排程系統')
}



