import * as http from 'http';
import io from 'socket.io';
import { InitProgramInfo, mainData, ParamSet, saveMainData, WebSet, WebUrlObj, Device } from '../data/main.data';
import { mainState } from '../data/main.state';
import { fileSys } from '../file-sys.lib';
import { procStartMsg } from '../is-production';
import { mainService } from '../main-service';
import { setting } from '../setting';
import { ocrLib } from './ocr.client';
import { qnxLib } from './qnx.server';
let server = http.createServer(function (request, response) { });
let port = setting.hostCmsPort;
// about 0.0.0.0:
// https://stackoverflow.com/questions/8325480/set-up-node-so-it-is-externally-visible
// https://stackoverflow.com/questions/14043926/node-js-connect-only-works-on-localhost
server.listen(port, '0.0.0.0', function () {
    // console.log('--------');
    // console.log('server is listening to CMS on: ' + port);
    // console.log('--------');
});
export let cmsLib = {
    cmsSocket: null as null | io.Socket,
    sendDataLog(msg: string) {
        //optional chain
        cmsLib.cmsSocket?.emit('DATA_LOG', msg);
    },
    sendErrLog(msg: string) {
        cmsLib.cmsSocket?.emit('ERR_LOG', msg);
    },
    tellVmzConnectingState(isConnecting: boolean) {
        cmsLib.cmsSocket?.emit('VMZ_CONNECTION_STATE', isConnecting);
    },
    tellParamCheckResult(isSucc: boolean) {
        cmsLib.cmsSocket?.emit('PARAM_CHECK_RESULT', isSucc);
    },
    // tellSiteChangingProcStoppedByUser() {
    //     cmsLib.cmsSocket?.emit('USER_STOP_CHANGING_SITE');
    // },
    tellIECantCloseErr() {
        cmsLib.cmsSocket?.emit('PREV_IE_CANT_CLOSE');
    },
    tellOcrConnected() {
        cmsLib.cmsSocket?.emit('OCR_CONNECTED');
    },
    tellParamCheckRelated(msg: string) {
        cmsLib.cmsSocket?.emit('PARAM_CHECK_RESULT_LOG', msg);
    },
    loader(isShow: boolean, text: string = '') {
        cmsLib.cmsSocket?.emit('LOADER', { isShow: isShow, text: text });
    },
    lockKvmPage(isLock: boolean) {
        cmsLib.cmsSocket?.emit('KVM_LOCK', isLock);

    },
    // tellDeviceNumInKvmPage(deviceNumArr: string[]) {
    //     cmsLib.cmsSocket?.emit('DEVICE_NUMBERS_IN_KVM_PAGE', deviceNumArr);
    // },
    hostCmsServerP() {
        let connectedRes = () => { };
        // socket.io需要聽http.server
        let serv_io = io.listen(server);
        serv_io.sockets.on('connection', function (socket) {
            cmsLib.sendDataLog(procStartMsg);
            const connectedMsg = `cms is connected on ${port}.`;
            mainService.logBoth(connectedMsg);

            cmsLib.cmsSocket = socket;
            connectedRes();
            socket.on('CHECK_MANAGE_PS', function (ps: string, reply: Function) {
                console.log('CHECK_MANAGEPS');
                reply(mainData.managementPassword === ps);
            })
            socket.on('INITIAL_DATA', function (data: null, reply: Function) {
                console.log('INITIAL_DATA');
                reply(mainData);
            })
            socket.on('UPDATE_PARAMS', function (paramSets: ParamSet[], reply: Function) {
                console.log('UPDATE_PARAMS');
                mainData.paramSets = paramSets;
                saveMainData();
                reply();
            })
            socket.on('UPDATE_URLS', function (webSets: WebSet[], reply: Function) {
                console.log('UPDATE_URLS');
                mainData.webSets = webSets;
                saveMainData();
                reply();
            });
            socket.on('WEBSET_INDEX', function (websetIndex: number, reply: Function) {
                console.log('WEBSET_INDEX');
                mainState.webSetIndex = websetIndex;
            });
            socket.on('UPDATE_SECONDS', function (webSwitchSecondObj: any, reply: Function) {
                console.log('UPDATE_SECONDS');
                mainData.webSwitchSecondObj = webSwitchSecondObj;
                saveMainData();
                reply();
            });
            socket.on('CHANGE_SITE', function (wuObj: WebUrlObj, reply: Function) {
                console.log('CHANGE_SITE');
                // mainState.kvmTaskManeger.trySetCurrTaskDone();
                let task = mainState.kvmTaskManeger.add(wuObj.deviceNumber, wuObj.url);
                let errMsg = '';
                if (task) task.ieOpenedProm.then(() => reply()).catch(() => reply());
                else {
                    errMsg = `${wuObj.deviceNumber}無法排入KVM陳列視窗，因已有作業中之KVM視窗，現已排入等待佇列中。`;
                    mainService.logBoth(errMsg);

                    reply(errMsg);
                };

            });
            // socket.on('CLOSE_SITE', function (url: string, reply: Function) {
            //     console.log('CLOSE_SITE');
            //     mainService.closeIeWindow(url);
            // })
            socket.on('TEST_CONNECTION', function (ips: string[], reply: Function) {
                console.log('TEST_CONNECTION');
                let isLasttermDeleted = false;
                if (ips[ips.length - 1] === '') {
                    ips.splice(ips.length - 1, 1);
                    isLasttermDeleted = true;
                }
                mainService.testConnection(ips).then((isValids: boolean[]) => {
                    if (isLasttermDeleted) isValids.push(true);
                    reply(isValids);
                }).catch(err => {
                    console.log(err);
                    reply(null);
                })
            });
            socket.on('SAVE_IPS', function (ips: string[], reply: Function) {
                console.log('SAVE_IPS');
                mainData.ips = ips;
                saveMainData();
                reply();
            });
            socket.on('SAVE_IE_POSITION', function (iePosition: any, reply: Function) {
                console.log('SAVE_IE_POSITION');
                mainData.ieWindowPosition = iePosition;
                saveMainData();
                reply();
            });
            socket.on('EXEC_AUTOMATION', function (ai: AutomationInfo, reply: Function) {
                mainService.execProcAfterReceiveFromIT(ai.msg, ai.deviceNum);
                // reply();
            });
            socket.on('switchTestModel', function (testMode: boolean, reply: Function) {
                mainData.testmode = testMode;
            })
            socket.on('UPDATE_INIT_PROC_PATHES', function (initialPrograms: InitProgramInfo[], reply: Function) {
                console.log('UPDATE_INIT_PROC_PATHES');
                mainData.initialPrograms = initialPrograms;
                saveMainData();
                reply();
            });
            socket.on('OPEN_INIT_PROC_PATHES', function (initialPrograms: InitProgramInfo[], reply: Function) {
                console.log('OPEN_INIT_PROC_PATHES');
                mainService.openSoftwares(initialPrograms.map(p => p.path), undefined, true);
            });
            socket.on('UPDATE_AUTOMATION_INFO', function (automationInfo: any, reply: Function) {
                console.log('UPDATE_AUTOMATION_INFO');
                mainData.automationInfo = automationInfo;
                saveMainData();
                reply();
            });
            socket.on('KVM_CONTAINER_INFO', function (info: KvmContainerInfo, reply: Function) {
                // console.log('KVM_CONTAINER_INFO');
                mainState.autoitProcessIndependencyGuard.onReceivingKvmPagePositionInfo(info);

                reply(mainState.kvmTaskManeger.queueToShowKvm)
            });
            socket.on('WRITE_BACK_LOG', function (logBack: WriteLogBackFormat, reply: Function) {
                const dir = 'logs';
                fileSys.makeIfNoDir(dir);
                const path = dir + `/${logBack.dateFileName}.txt`;
                fileSys.appendFile(path, logBack.msg);
            });
            socket.on('CLOSE_NW', function (data: null, reply: Function) {
                console.log('CLOSE_NW');
                let subClosingWinProms: Promise<any>[] = [];
                mainData.initialPrograms.forEach(info => {
                    if (info.windowTitle !== '') subClosingWinProms.push(mainService.closeWindowByTitleP(info.windowTitle));
                })
                Promise.all(subClosingWinProms).then(() => {
                    reply();
                    mainService.closeWindowByPidP(process.pid.toString());
                });
            });

            socket.on('IE_AUTH', function (logBack: WriteLogBackFormat, reply: Function) {
                console.log('IE_AUTH');
                mainService.execIEAuth(24).then(() => reply()).catch(() => reply());
            });

            interface DevInfo { type: DevType, data: any }
            type DevType = '傳送比對結果' | 'OCR偵測';
            socket.on('DEV_CMD', function (info: DevInfo, reply: Function) {
                console.log('DEV_CMD', info);
                if (info.type === '傳送比對結果') { mainState.kvmTaskManeger.loadCsvQue[0].receiveCheckParamResult(info.data); }
                else if (info.type === 'OCR偵測') { ocrLib.sockets[info.data - 1]?.write('dev-detected') }
            });
            socket.on('UPDATE_DEVICES', function (devices: Device[], reply: Function) {
                console.log('UPDATE_DEVICES');
                mainData.devices = devices;
                saveMainData();
                reply();
            });


        });
        return new Promise<void>((res, rej) => {
            connectedRes = res;
        })
    }
}
interface AutomationInfo {
    msg: string,
    deviceNum: string
}
class WriteLogBackFormat {
    constructor(public msg: string, timeStr: string) {
        this.dateFileName = timeStr.split(' ')[0].replace(/\//g, '');
    }
    dateFileName: string;
}