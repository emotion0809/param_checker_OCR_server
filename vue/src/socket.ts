import io from 'socket.io-client';
import { mainService } from './main-service';
import { backData, ParamSet, WebSet, MainDataBack } from './data/back.data';
import { frontData } from './data/front.data';

const port = 8083;
const url = 'http://localhost:' + port;//不輸入時會根據window.location連線
console.log('connected to ' + port);
// let dbOnLinux = 'http://52.231.202.252:443/';
// console.log(dbOnLinux);
export let socket = io(url);


type MainDataBackeys = 'paramSets' | 'managementPassword' | 'webSets' | 'webSwitchSecondObj' | 'ips' | 'initialPrograms' | 'automationInfo';

socket.on('connect', () => {

    console.log('已連線');
    socket.emit('INITIAL_DATA', null, (d: MainDataBack) => {
        console.log(d)
        Object.keys(d).forEach(key => (backData as any)[key] = d[key as MainDataBackeys]);
        socketLib.dataLoadedRes();
    });
});

socket.on('DATA_LOG', function (log: string, reply: Function) {
    mainService.handleLogs(log, false);

    // let dataToReply: ResponseObj = { status: 200, payload: '客戶端也可以回覆喔' };
    // reply(dataToReply);

})
socket.on('ERR_LOG', function (errMsg: string, reply: Function) {
    mainService.handleLogs(errMsg, true);
    mainService.alert(errMsg);
})

socket.on('PARAM_CHECK_RESULT', function (isSucc: boolean, reply: Function) {
    socketLib.resFuncForCheckResult(isSucc ?
        backData.webSwitchSecondObj.waitAfterCheckSucc * 1000 : backData.webSwitchSecondObj.waitAfterCheckFail * 1000);
    mainService.inform(isSucc ? '比對成功' : '比對失敗', !isSucc);
});

socket.on('PREV_IE_CANT_CLOSE', function (data: null, reply: Function) {
    // socketLib.stopChangingSiteProcRej({ msg: '偵測到第三個IE視窗開啟（第二個執行失敗），流程暫停，可選擇繼續流程。', rollbackCount: -1 });
});

socket.on('OCR_CONNECTED', function (data: null, reply: Function) {
    mainService.loader(false, '');
});

socket.on('PARAM_CHECK_RESULT_LOG', function (msg: string, reply: Function) {
    mainService.handleParamCheckLog(msg);
})

socket.on('LOADER', function (loaderObj: { isShow: boolean, text: string }, reply: Function) {
    mainService.loader(loaderObj.isShow, loaderObj.text);
});

let lockCount = 0;
socket.on('KVM_LOCK', function (isLock: boolean, reply: Function) {
    if (isLock) lockCount++;
    else lockCount--;

    frontData.isLockInKvmPage = lockCount > 0 ? true : false;
    mainService.enterKvmPage();
});


// socket.on('USER_STOP_CHANGING_SITE', function (data: null, reply: Function) {
//     socketLib.stopChangingSiteProcRej('切換網址流程中止');
// });



export let socketLib = {
    socket: socket,
    dataLoadedRes: () => { },
    resFuncForCheckResult: (msToClose: number) => { },
    stopChangingSiteProcRej: (switchWebExecption: SwitchWebExecption) => { },
    emitEvent(eventName: EventName, data?: any, onReplied?: Function) {
        if (socket.disconnected) mainService.alert('系統未連線，請重新啟動')
        else socket.emit(eventName, data, onReplied);
    }
}

type EventName = 'CHECK_MANAGE_PS' | 'UPDATE_PARAMS' |
    'WRITE_BACK_LOG' | 'OPEN_FOLDER' | 'INIT_VMZ' | 'UPDATE_URLS' | 'CHANGE_SITE' |
    'UPDATE_SECONDS' | 'CLOSE_SITE' | 'TEST_CONNECTION' | 'SAVE_IPS' | 'SAVE_IE_POSITION' |
    'EXEC_AUTOMATION' | 'UPDATE_INIT_PROC_PATHES' | 'OPEN_INIT_PROC_PATHES' |
    'UPDATE_AUTOMATION_INFO' | 'KVM_CONTAINER_INFO' | 'WEBSET_INDEX' | 'CLOSE_NW' | 'IE_AUTH' | 'DEV_CMD' | 'UPDATE_DEVICES' 
    | 'switchTestModel';


