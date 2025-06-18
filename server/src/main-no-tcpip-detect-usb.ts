import * as net from 'net';
import { fileSys } from "./file-sys.lib";
import { isProduction } from "./is-production";
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

        if (!isProduction && isShowExistence) service.logBoth(setting.diskToCheck + '存在:' + fileSys.checkExistence(setting.diskToCheck));

        //狀態發生變化才進行動作
        if (fileSys.checkExistence(setting.diskToCheck)) {
            if (!isDiskDetected) {
                service.logBoth(`偵測到${setting.diskToCheck[0]}碟，將進行excel檔案傳輸`);
                isDiskDetected = true;

                // 檢查有無連線
                if (!isConnected) {
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
                let originPath = detetedCsvFolderName + '\\origin\\' + excelFileName;
                let temperatureParamAddedPath = detetedCsvFolderName + '\\temperature-added\\' + excelFileName;
                [originPath, temperatureParamAddedPath].forEach(path => fileSys.copyFile(excelPath, path));

                sendExcelFileToServer(excelPath);
            }
        } else {
            if (isDiskDetected) {
                service.logBoth(`${setting.diskToCheck[0]}碟已卸除`);
                isDiskDetected = false;
            }
        }
    }, setting.checkDiskInterval)
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
    if (isConnected) return;
    service.logBoth(`Trying to connect to param check server where port=${setting.checkParamHostPort} and ip=${ip}`);
    socket = net.createConnection(setting.checkParamHostPort, ip);
    socket.on('connect', () => {
        isConnected = true;
        service.logBoth('connected to param check.');

        socket.on('data', (data: any) => {
        });
    })
    socket.on('end', function () {
        isConnected = false;
        service.logBoth("連線結束");
    });
    socket.on('error', function (err) {
        isConnected = false;
        service.logBoth("Error: " + err.message);
        service.logBoth("Try to reconnect within 10s.")
    })
}
function getTempaeratureParam() { }
let isConnected = false;
let socket: net.Socket;

