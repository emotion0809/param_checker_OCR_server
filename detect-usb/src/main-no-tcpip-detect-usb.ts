import * as net from 'net';
import { ExecAsyncFuncTimer } from './exec-async-func-timer';
import { fileSys } from "./file-sys.lib";
import { modbusLib } from './modbus.lib';
import { setting } from "./setting";
import { service, TemperatureSetting } from './usb-detect.service';


const isShowExistence = false;
const ip = fileSys.readFileSyncWithDefaultStr('../ip.txt', 'localhost');
const temperatureSettingStr = fileSys.readFileSyncWithDefaultStr('../temperature-setting.txt', JSON.stringify(new TemperatureSetting()));
let temperatureSetting: TemperatureSetting;
try {
    temperatureSetting = JSON.parse(temperatureSettingStr);
} catch (error) {
    service.logBoth(error);
    service.logBoth('溫度設定檔讀取失敗，因格式異常，須修正成JSON格式，或者亦可刪除設定檔並重開程式以自動建立預設設定檔');
    service.logBoth('因為溫度設定檔格式異常，溫度設定採用系統預設值');
    temperatureSetting = new TemperatureSetting();
}


let isDiskDetected = false;

// simply waiting for service to be initiated.
setTimeout(() => {
    service.logBoth('USB偵測程序開始...');
}, 0);

const checkConnectionT = 10000;
connectToParamCheck();
setInterval(connectToParamCheck, checkConnectionT);
listenUsbAndItsCsv();


function listenUsbAndItsCsv() {
    service.logBoth(`監測${setting.diskToCheck[0]}碟加載情況中。`);
    setInterval(() => {

        if (isShowExistence) service.logBoth(setting.diskToCheck + '存在:' + fileSys.checkExistence(setting.diskToCheck));

        //狀態發生變化才進行動作
        if (fileSys.checkExistence(setting.diskToCheck)) {
            if (!isDiskDetected) {
                service.logBoth(`偵測到${setting.diskToCheck[0]}碟，將進行excel檔案傳輸`);
                isDiskDetected = true;

                // 檢查有無連線
                if (!isConnectedToParamCheckServer) {
                    service.logBoth('未與參數校對程式連線，檔案傳輸作業取消');
                    return;
                }

                // 檢查USB中有無合乎名稱的csv檔、xlsx檔
                let excelPath: string = '';
                let excelFileName: string = '';
                let excelPaths: string[] = [];
                if (
                    setting.excelFileNames.every(
                        name => {
                            let path = setting.diskToCheck + name;
                            excelPaths.push(path);
                            let isExist = fileSys.checkExistence(path);
                            if (isExist) {
                                excelPath = path;
                                excelFileName = name;
                            }
                            return !isExist
                        }
                    ) //都不存在合乎名稱的檔案就不執行下去
                ) {
                    service.logBoth('無法在以下路徑找到excel檔：' + JSON.stringify(excelPaths));
                    return
                }

                // 備份到兩個資料夾，一個是原本的，一個是有溫度資料的
                let detetedCsvFolderName = 'detected-csv';
                fileSys.makeIfNoDir(detetedCsvFolderName);
                let dateId = service.getFormattedDate(new Date(), 'YMDhms');
                let datIdFolderPath = detetedCsvFolderName + '\\' + dateId;
                fileSys.makeIfNoDir(datIdFolderPath);
                let originPath = datIdFolderPath + '\\origin\\' + excelFileName;
                let temperatureParamAddedPath = datIdFolderPath + '\\temperature-added\\' + excelFileName;
                //都備份好才往下做
                Promise
                    .all([originPath, temperatureParamAddedPath].map(path => fileSys.copyFileP(excelPath, path)))
                    .then( //取得溫度
                        () => timer.insertAsyncTask(readTemperatures).catch(err => {
                            service.logBoth(err);
                            return Promise.reject('無法取得溫度資料');
                        })
                    )
                    .then( //製作appendStr
                        (rawTemperatures) => {
                            let appendStr = ''; //前已有空行
                            appendStr += temperatureSetting.setName + '\n';
                            let order = 1;
                            temperatureSetting.channelInfos.forEach((ci, i) => {
                                if (ci.isAsTemperatureParam) {
                                    appendStr += `${order},${ci.name},${rawTemperatures[i] / 10 + ci.userSpecifiedTemperatureConstant},${ci.channelValueUnit}\n`
                                    order++;
                                }
                            });
                            return appendStr;
                        }
                    )
                    .then( //寫入檔案
                        (appendStr) => {
                            fileSys.appendFile(temperatureParamAddedPath, appendStr, false);
                        }
                    )
                    .then( //傳送檔案
                        () => {
                            sendExcelFileToServer(temperatureParamAddedPath);
                        }
                    )
                    .catch(err => {
                        service.logBoth(err);
                        service.logBoth('無法傳送參數csv檔給參數比對伺服器，請檢視log訊息以排除異常');
                    })

            }
        } else {
            if (isDiskDetected) {
                service.logBoth(`${setting.diskToCheck[0]}碟已卸除`);
                isDiskDetected = false;
            }
        }
    }, setting.checkDiskInterval);
}

function sendExcelFileToServer(excelPath: string) {
    service.logBoth(`傳輸${excelPath}檔案`);
    socket.write('excel-name:' + excelPath.slice(excelPath.lastIndexOf('\\') + 1), 'utf8');
    //為了防止傳輸資料沾黏
    setTimeout(() => {
        socket.write(fileSys.readFileSync(excelPath, 'binary'), 'utf8');
    }, setting.delayAfterExcelName)

    setTimeout(() => {
        socket.write('excel-end');
    }, setting.delayAfterExcelName + setting.delayAfterExeclContent)
}

function connectToParamCheck() {
    if (isConnectedToParamCheckServer) return;
    service.logBoth(`Trying to connect to param check server where port=${setting.checkParamHostPort} and ip=${ip}`);
    socket = net.createConnection(setting.checkParamHostPort, ip);
    socket.on('connect', () => {
        isConnectedToParamCheckServer = true;
        service.logBoth('已連線至比對伺服器');

        socket.on('data', (data: any) => {
        });
    })
    socket.on('end', function () {
        isConnectedToParamCheckServer = false;
        service.logBoth("與比對伺服器連線結束");
    });
    socket.on('error', function (err) {
        isConnectedToParamCheckServer = false;
        service.logBoth("Error: " + err.message);
        service.logBoth(`將於${checkConnectionT / 1000}秒內重新嘗試連線至比對伺服器`)
    })
}

let isConnectedToParamCheckServer = false;
let socket: net.Socket;

//--- modbus
let modbusSetting = {
    comportName: 'COM6',
    baudrate: 9600,
    askInterval: 1000,
    checkConnectionInterval: 10 * 1000,
    /** 測試用功能 */
    ifKeepReading: false,
    askCount: 0
}

// 基本上一定會到then，所以就是開程式時先嘗試直接連線
connectToDTMProm().then((result) => {

    if (modbusSetting.ifKeepReading) {
        service.logBoth(`已啟用監控溫度功能，將持續呈報溫度資料。`);

        startTemperatureMonitoring();
    }

    // 因為斷線不會知道，所以持續幫連
    keepCheckingConnectionToDTM();

}).catch(err => service.logBoth(err));

const timer = new ExecAsyncFuncTimer(modbusSetting.askInterval, read, true)
/**
 * 持續讀取並顯示溫度資料，若發生異常（包括斷線）則嘗試重連。
 */
function startTemperatureMonitoring() {
    timer.start();
}
async function read() {
    modbusSetting.askCount++;
    let askTime = new Date();
    return readTemperatures().then(temperatures => {
        let respondTime = new Date();
        let delayMs = respondTime.getTime() - askTime.getTime();
        let template = `
詢問次序：${modbusSetting.askCount}
延遲（毫秒）：${delayMs}
回覆內容：${JSON.stringify(temperatures)}
-----------------------------------`;
        console.log(template);
    }).catch(error => {
        console.log(error);
        return connectToDTMProm()
            .then(er => service.logBoth(er.msg))
            .catch(err => service.logBoth(err));
    });
}
function keepCheckingConnectionToDTM() {
    service.logBoth(`將持續檢測與台達DTM之連線，若未連線將自動嘗試重連`);
    setInterval(() => {
        if (!modbusLib.client.isOpen) {
            connectToDTMProm().then(er => {
                service.logBoth(er.msg);
            }).catch(err => service.logBoth(err));
        }
        else { } //已連線中就不作事
    }, modbusSetting.checkConnectionInterval)
}

function connectToDTMProm() {
    service.logBoth('嘗試連線至台達DTM');
    return modbusLib.connectRTUBufferedP(modbusSetting.comportName, { baudRate: modbusSetting.baudrate })
}
function readTemperatures() {
    return modbusLib.readHoldingRegisters(1, 0x0268, 0x0008).then(result => result.data)
}
