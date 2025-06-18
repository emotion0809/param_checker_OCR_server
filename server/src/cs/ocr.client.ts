import * as net from 'net';
import { mainState } from '../data/main.state';
import { mainService } from '../main-service';
import { setting } from '../setting';
import { qnxLib } from './qnx.server';
import { mainData } from '../data/main.data';

export const ocrLib = {
    sockets: [null, null, null, null] as (null | net.Socket)[],
    firstConnectRes: () => { },
    isConnectedArr: [false, false, false, false],
    connectToOCR(portIndex: number) {
        if (ocrLib.isConnectedArr[portIndex]) return;
        const port = setting.ocrPortsForParamCheck[portIndex];
        const ocrNum = portIndex + 1;
        const tryingToConnectMsg = `trying to connect to OCR${ocrNum} where port=${port}`;
        let isProcessSingnal = false
        mainService.logBoth(tryingToConnectMsg);

        let socketToOcr = net.createConnection(port);
        socketToOcr.on('connect', () => {
            if (portIndex === 0) this.firstConnectRes();
            ocrLib.isConnectedArr[portIndex] = true;
            ocrLib.sockets[portIndex] = socketToOcr;
            const connectedMsg = `已連接至OCR${ocrNum}`;
            mainService.logBoth(connectedMsg);

            socketToOcr.on('data', (data: any) => {
                let dataStr: string = data.toString();
                let msgWithData = `    (OCR${ocrNum}):${data}`
                mainService.logBoth(msgWithData);
                if ('auto' === dataStr.slice(0, 4)) {
                    if(!isProcessSingnal){
                        let index = Number(dataStr.slice(4)); //1~4
                        let task = mainState.kvmTaskManeger.queueToShowKvm[index - 1];
                        if (task) {
                            if (task.canTriggerLoadCsvProcedure) {
                                task.screenControl(true); //會不會剛好被解屏，應該不會，因為只有IT的會解，但是離鎖有相當時間差
                                mainState.kvmTaskManeger.markWithLoadingCsvTask(task);
                                mainState.kvmTaskManeger.enterLoadCsvQue(task)    
                            }
                            else {
                                mainService.logBoth(`OCR${ocrNum}於位置${index}偵測到待清除之機台${task.deviceNum ? task.deviceNum : ''}畫面，不觸發流程`);
                            }
                        }
                        else {
                            mainService.logBothErr(`OCR${ocrNum}偵測錯誤，位置${index}無KVM畫面`);
                        }
                        setTimeout(() =>{
                            isProcessSingnal = false
                        },1000 * 5)
                    }
                }
            });
        })
        socketToOcr.on('end', function () {
            ocrLib.isConnectedArr[portIndex] = false;
            let msg = `OCR${ocrNum}連線結束`;
            mainService.logBoth(msg);
        });
        socketToOcr.on('error', function (err) {
            ocrLib.isConnectedArr[portIndex] = false;
            const errMsg = `Error at OCR${ocrNum} : ` + err.message;
            mainService.logBothErr(errMsg);
            const retryMsg = `Try to reconnect to OCR${ocrNum} within ${checkConnectionT / 1000}s.`;
            mainService.logBoth(retryMsg);
        })
    },
    firstConnectToOcrP() {
        mainService.logBoth('待OCR1連接上，便會結束初始Loading狀態');
        [0, 1, 2, 3].forEach(portIndex => {
            ocrLib.connectToOCR(portIndex);
            setInterval(() => ocrLib.connectToOCR(portIndex), checkConnectionT);
        })

        return new Promise<void>((res, rej) => {
            ocrLib.firstConnectRes = res;
        })
    }

}


const checkConnectionT = 10000;