import { mainService } from "../main-service";
import { setting } from "../setting";

// 鑒於Promise串起來是不好追蹤情況的（比如說接了幾個），還是用array追蹤吧
class TaskQueManager {
    isDoingTask: boolean = false;
    constructor(public managerName: string, public checkIntervalMs: number = 300) {
        setInterval(() => {
            if (this.isDoingTask) { }
            else {
                let firstTask = this.taskQue[0];
                if (firstTask) {
                    this.isDoingTask = true;
                    firstTask.funcPToExec().then(
                        // succ
                        () => {
                            this.finishTask();
                        },
                        // fail
                        () => {
                            //要不要在這這邊處理錯誤再看看吧
                            this.finishTask();
                        }
                    )
                }
            }

        }, this.checkIntervalMs);
    }
    taskQue: Task[] = [];
    finishTask() {
        this.isDoingTask = false;
        this.taskQue.splice(0, 1);
    }
    push(taskName: TaskNames, funcPToExec: () => Promise<any>) {
        let newTask = new Task(funcPToExec, taskName);
        this.taskQue.push(newTask);
        return newTask.taskDoneProm;
    }
}

// PC: param check
export class TaskQueManagerInPC extends TaskQueManager {
    taskQue: TaskInPC[] = [];
    constructor(managerName: string, checkIntervalMs: number = 300) {
        super(managerName, checkIntervalMs)
    }
    push(taskName: TaskNames, funcPToExec: () => Promise<any>) {
        let newTask = new TaskInPC(funcPToExec, taskName);
        this.taskQue.push(newTask);
        if (this.taskQue.length > 1) {
            mainService.logBoth(`${this.managerName}：新增待執行任務，當前任務佇列為：${this.taskQue.map(task => task.name).join(',')}`);
        }
        return newTask.taskDoneProm;
    }
    onReceivingKvmPagePositionInfo(info: KvmContainerInfo) {
        // 如果沒有任何任務
        if (!this.taskQue[0]) {
            this.taskQue.push(createAlignKvmTask());
        }
        else if (this.taskQue[0].name !== 'KVM畫面排列') {
            if (this.taskQue[1]) {
                // 已有就不用在管了
                if (this.taskQue[1].name === 'KVM畫面排列') { }
                // 第一個跟第二個都是別的任務的時候，第二個插一個kvm畫面排列
                else this.taskQue.splice(1, 0, createAlignKvmTask());
            }
            else {
                this.taskQue.push(createAlignKvmTask());
            }
        }
        else { }

        function createAlignKvmTask() {
            return new TaskInPC(() => mainService.alignKvmWindows(info.x, info.y, info.xDisplace, info.yDisplace), 'KVM畫面排列')
        }
    }
}


class Task {
    taskDoneRes = () => { }
    taskDoneRej = () => { }
    // 注意這不可寫在上面否則res,rej會被蓋掉
    taskDoneProm = new Promise<void>((res, rej) => {
        this.taskDoneRes = res;
        this.taskDoneRej = rej;
    });
    constructor(public funcPToExec: () => Promise<any>, public name: string) {
        let funcP = funcPToExec; //記得不改個變數存著會壞掉
        this.funcPToExec = () => {
            let prom = funcP();
            prom.then(this.taskDoneRes).catch(this.taskDoneRej);//這是返回給外面當作真實的prom使用
            return prom; //跟上面的then,catch無關
        }
    }
}

class TaskInPC extends Task {
    // 這邊funcPToExec不可以寫public，否則會蓋掉母的
    constructor(funcPToExec: () => Promise<any>, public name: TaskNames) {
        super(funcPToExec, name);
    }
}


// new TaskInPC(() => Promise.resolve(''), 'IE驗證流程')

type TaskNames = '解鎖屏' | 'IE驗證流程' | '讀取CSV檔' | 'KVM畫面排列' | '傳送結果按鍵組合' | '取消Auto'