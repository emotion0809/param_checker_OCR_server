"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var net = __importStar(require("net"));
var exec_async_func_timer_1 = require("./exec-async-func-timer");
var file_sys_lib_1 = require("./file-sys.lib");
var modbus_lib_1 = require("./modbus.lib");
var setting_1 = require("./setting");
var usb_detect_service_1 = require("./usb-detect.service");
var isShowExistence = false;
var ip = file_sys_lib_1.fileSys.readFileSyncWithDefaultStr('../ip.txt', 'localhost');
var temperatureSettingStr = file_sys_lib_1.fileSys.readFileSyncWithDefaultStr('../temperature-setting.txt', JSON.stringify(new usb_detect_service_1.TemperatureSetting()));
var temperatureSetting;
try {
    temperatureSetting = JSON.parse(temperatureSettingStr);
}
catch (error) {
    usb_detect_service_1.service.logBoth(error);
    usb_detect_service_1.service.logBoth('溫度設定檔讀取失敗，因格式異常，須修正成JSON格式，或者亦可刪除設定檔並重開程式以自動建立預設設定檔');
    usb_detect_service_1.service.logBoth('因為溫度設定檔格式異常，溫度設定採用系統預設值');
    temperatureSetting = new usb_detect_service_1.TemperatureSetting();
}
var isDiskDetected = false;
// simply waiting for service to be initiated.
setTimeout(function () {
    usb_detect_service_1.service.logBoth('USB偵測程序開始...');
}, 0);
var checkConnectionT = 10000;
connectToParamCheck();
setInterval(connectToParamCheck, checkConnectionT);
listenUsbAndItsCsv();
function listenUsbAndItsCsv() {
    usb_detect_service_1.service.logBoth("\u76E3\u6E2C".concat(setting_1.setting.diskToCheck[0], "\u789F\u52A0\u8F09\u60C5\u6CC1\u4E2D\u3002"));
    setInterval(function () {
        if (isShowExistence)
            usb_detect_service_1.service.logBoth(setting_1.setting.diskToCheck + '存在:' + file_sys_lib_1.fileSys.checkExistence(setting_1.setting.diskToCheck));
        //狀態發生變化才進行動作
        if (file_sys_lib_1.fileSys.checkExistence(setting_1.setting.diskToCheck)) {
            if (!isDiskDetected) {
                usb_detect_service_1.service.logBoth("\u5075\u6E2C\u5230".concat(setting_1.setting.diskToCheck[0], "\u789F\uFF0C\u5C07\u9032\u884Cexcel\u6A94\u6848\u50B3\u8F38"));
                isDiskDetected = true;
                // 檢查有無連線
                if (!isConnectedToParamCheckServer) {
                    usb_detect_service_1.service.logBoth('未與參數校對程式連線，檔案傳輸作業取消');
                    return;
                }
                // 檢查USB中有無合乎名稱的csv檔、xlsx檔
                var excelPath_1 = '';
                var excelFileName_1 = '';
                var excelPaths_1 = [];
                if (setting_1.setting.excelFileNames.every(function (name) {
                    var path = setting_1.setting.diskToCheck + name;
                    excelPaths_1.push(path);
                    var isExist = file_sys_lib_1.fileSys.checkExistence(path);
                    if (isExist) {
                        excelPath_1 = path;
                        excelFileName_1 = name;
                    }
                    return !isExist;
                }) //都不存在合乎名稱的檔案就不執行下去
                ) {
                    usb_detect_service_1.service.logBoth('無法在以下路徑找到excel檔：' + JSON.stringify(excelPaths_1));
                    return;
                }
                // 備份到兩個資料夾，一個是原本的，一個是有溫度資料的
                var detetedCsvFolderName = 'detected-csv';
                file_sys_lib_1.fileSys.makeIfNoDir(detetedCsvFolderName);
                var dateId = usb_detect_service_1.service.getFormattedDate(new Date(), 'YMDhms');
                var datIdFolderPath = detetedCsvFolderName + '\\' + dateId;
                file_sys_lib_1.fileSys.makeIfNoDir(datIdFolderPath);
                var originPath = datIdFolderPath + '\\origin\\' + excelFileName_1;
                var temperatureParamAddedPath_1 = datIdFolderPath + '\\temperature-added\\' + excelFileName_1;
                //都備份好才往下做
                Promise
                    .all([originPath, temperatureParamAddedPath_1].map(function (path) { return file_sys_lib_1.fileSys.copyFileP(excelPath_1, path); }))
                    .then(//取得溫度
                function () { return timer.insertAsyncTask(readTemperatures).catch(function (err) {
                    usb_detect_service_1.service.logBoth(err);
                    return Promise.reject('無法取得溫度資料');
                }); })
                    .then(//製作appendStr
                function (rawTemperatures) {
                    var appendStr = ''; //前已有空行
                    appendStr += temperatureSetting.setName + '\n';
                    var order = 1;
                    temperatureSetting.channelInfos.forEach(function (ci, i) {
                        if (ci.isAsTemperatureParam) {
                            appendStr += "".concat(order, ",").concat(ci.name, ",").concat(rawTemperatures[i] / 10 + ci.userSpecifiedTemperatureConstant, ",").concat(ci.channelValueUnit, "\n");
                            order++;
                        }
                    });
                    return appendStr;
                })
                    .then(//寫入檔案
                function (appendStr) {
                    file_sys_lib_1.fileSys.appendFile(temperatureParamAddedPath_1, appendStr, false);
                })
                    .then(//傳送檔案
                function () {
                    sendExcelFileToServer(temperatureParamAddedPath_1);
                })
                    .catch(function (err) {
                    usb_detect_service_1.service.logBoth(err);
                    usb_detect_service_1.service.logBoth('無法傳送參數csv檔給參數比對伺服器，請檢視log訊息以排除異常');
                });
            }
        }
        else {
            if (isDiskDetected) {
                usb_detect_service_1.service.logBoth("".concat(setting_1.setting.diskToCheck[0], "\u789F\u5DF2\u5378\u9664"));
                isDiskDetected = false;
            }
        }
    }, setting_1.setting.checkDiskInterval);
}
function sendExcelFileToServer(excelPath) {
    usb_detect_service_1.service.logBoth("\u50B3\u8F38".concat(excelPath, "\u6A94\u6848"));
    socket.write('excel-name:' + excelPath.slice(excelPath.lastIndexOf('\\') + 1), 'utf8');
    //為了防止傳輸資料沾黏
    setTimeout(function () {
        socket.write(file_sys_lib_1.fileSys.readFileSync(excelPath, 'binary'), 'utf8');
    }, setting_1.setting.delayAfterExcelName);
    setTimeout(function () {
        socket.write('excel-end');
    }, setting_1.setting.delayAfterExcelName + setting_1.setting.delayAfterExeclContent);
}
function connectToParamCheck() {
    if (isConnectedToParamCheckServer)
        return;
    usb_detect_service_1.service.logBoth("Trying to connect to param check server where port=".concat(setting_1.setting.checkParamHostPort, " and ip=").concat(ip));
    socket = net.createConnection(setting_1.setting.checkParamHostPort, ip);
    socket.on('connect', function () {
        isConnectedToParamCheckServer = true;
        usb_detect_service_1.service.logBoth('已連線至比對伺服器');
        socket.on('data', function (data) {
        });
    });
    socket.on('end', function () {
        isConnectedToParamCheckServer = false;
        usb_detect_service_1.service.logBoth("與比對伺服器連線結束");
    });
    socket.on('error', function (err) {
        isConnectedToParamCheckServer = false;
        usb_detect_service_1.service.logBoth("Error: " + err.message);
        usb_detect_service_1.service.logBoth("\u5C07\u65BC".concat(checkConnectionT / 1000, "\u79D2\u5167\u91CD\u65B0\u5617\u8A66\u9023\u7DDA\u81F3\u6BD4\u5C0D\u4F3A\u670D\u5668"));
    });
}
var isConnectedToParamCheckServer = false;
var socket;
//--- modbus
var modbusSetting = {
    comportName: 'COM6',
    baudrate: 9600,
    askInterval: 1000,
    checkConnectionInterval: 10 * 1000,
    /** 測試用功能 */
    ifKeepReading: false,
    askCount: 0
};
// 基本上一定會到then，所以就是開程式時先嘗試直接連線
connectToDTMProm().then(function (result) {
    if (modbusSetting.ifKeepReading) {
        usb_detect_service_1.service.logBoth("\u5DF2\u555F\u7528\u76E3\u63A7\u6EAB\u5EA6\u529F\u80FD\uFF0C\u5C07\u6301\u7E8C\u5448\u5831\u6EAB\u5EA6\u8CC7\u6599\u3002");
        startTemperatureMonitoring();
    }
    // 因為斷線不會知道，所以持續幫連
    keepCheckingConnectionToDTM();
}).catch(function (err) { return usb_detect_service_1.service.logBoth(err); });
var timer = new exec_async_func_timer_1.ExecAsyncFuncTimer(modbusSetting.askInterval, read, true);
/**
 * 持續讀取並顯示溫度資料，若發生異常（包括斷線）則嘗試重連。
 */
function startTemperatureMonitoring() {
    timer.start();
}
function read() {
    return __awaiter(this, void 0, void 0, function () {
        var askTime;
        return __generator(this, function (_a) {
            modbusSetting.askCount++;
            askTime = new Date();
            return [2 /*return*/, readTemperatures().then(function (temperatures) {
                    var respondTime = new Date();
                    var delayMs = respondTime.getTime() - askTime.getTime();
                    var template = "\n\u8A62\u554F\u6B21\u5E8F\uFF1A".concat(modbusSetting.askCount, "\n\u5EF6\u9072\uFF08\u6BEB\u79D2\uFF09\uFF1A").concat(delayMs, "\n\u56DE\u8986\u5167\u5BB9\uFF1A").concat(JSON.stringify(temperatures), "\n-----------------------------------");
                    console.log(template);
                }).catch(function (error) {
                    console.log(error);
                    return connectToDTMProm()
                        .then(function (er) { return usb_detect_service_1.service.logBoth(er.msg); })
                        .catch(function (err) { return usb_detect_service_1.service.logBoth(err); });
                })];
        });
    });
}
function keepCheckingConnectionToDTM() {
    usb_detect_service_1.service.logBoth("\u5C07\u6301\u7E8C\u6AA2\u6E2C\u8207\u53F0\u9054DTM\u4E4B\u9023\u7DDA\uFF0C\u82E5\u672A\u9023\u7DDA\u5C07\u81EA\u52D5\u5617\u8A66\u91CD\u9023");
    setInterval(function () {
        if (!modbus_lib_1.modbusLib.client.isOpen) {
            connectToDTMProm().then(function (er) {
                usb_detect_service_1.service.logBoth(er.msg);
            }).catch(function (err) { return usb_detect_service_1.service.logBoth(err); });
        }
        else { } //已連線中就不作事
    }, modbusSetting.checkConnectionInterval);
}
function connectToDTMProm() {
    usb_detect_service_1.service.logBoth('嘗試連線至台達DTM');
    return modbus_lib_1.modbusLib.connectRTUBufferedP(modbusSetting.comportName, { baudRate: modbusSetting.baudrate });
}
function readTemperatures() {
    return modbus_lib_1.modbusLib.readHoldingRegisters(1, 0x0268, 0x0008).then(function (result) { return result.data; });
}
