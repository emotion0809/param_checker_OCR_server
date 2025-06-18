export class LogObj {
    constructor(public logMsg: string, public isErr: boolean) {
    }
    receivedT: string = getDateString(new Date());
}

class FrontData {
    isSystemRunning: boolean = false;
    user: User | null = null;
    users: User[] = [];
    logs: LogObj[] = [];
    paramCheckLogs: LogObj[] = [];
    isLockInKvmPage = false;
    isRunning: Boolean = false;
}
export let frontData = new FrontData();
export class User {
    constructor(public accountName: string, public password: string, public auth: AuthType = AuthType.basic) {
    }
    id: number = new Date().getTime();
    lastLognT: Date | null = null
}
export enum AuthType {
    root,
    basic
}

function getDateString(d: Date) {
    var year = d.getFullYear();
    var month = pad(d.getMonth() + 1);
    var day = pad(d.getDate());
    var hour = pad(d.getHours());
    var min = pad(d.getMinutes());
    var sec = pad(d.getSeconds());
    // return year + month + day + hour + min + sec;
    return year + "/" + month + "/" + day + " " + hour + ":" + min + ":" + sec;
    //YYYYMMDDhhmmss
    function pad(v: number) {
        return (v < 10) ? '0' + v : v
    }
}