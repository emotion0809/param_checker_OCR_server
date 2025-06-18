import * as net from 'net';
import { fileSys as fileSys } from "../file-sys.lib";
import { keys } from "../lib/keys.lib";
import { paramCheckerLib } from "../lib/param-checker.lib";
import { setting } from "../setting";
import { cmsLib } from './cms.server';
import { mainState } from '../data/main.state';
import { mainService } from '../main-service';
import * as fs from 'fs';


// 功能: 1.接收excel檔 2.紀錄比對結果
export function hostParamCheckServer() {

    const clientName = 'Usb-Detection';
    let excelName = '';
    let excelContent = '';

    //create server
    var server = net.createServer();
    //start server with a port to listen to
    server.listen(setting.checkParamHostPort, function () {
        const msg = 'Param Check Server starts listening at port: ' + setting.checkParamHostPort;
        console.log(msg);
        cmsLib.sendDataLog(msg);
    });

    server.on('connection', function (socket) {
        const connectedMsg = `A new connection from ${clientName} has been established.`;
        console.log(connectedMsg);
        cmsLib.sendDataLog(connectedMsg);
        const waitingFileMsg = `監測Excel檔傳入情況中。`;
        console.log(waitingFileMsg);
        cmsLib.sendDataLog(waitingFileMsg);
        const addressMsg = socket.remoteAddress;

        //excel讀檔跟存檔都用binary,傳輸不只傳送端,接收端也要寫死，否則我猜node會猜encoding或之類的，會發生存檔時用ascii頭一次會過，後面都會壞掉的怪異行為。
        socket.setEncoding("utf8");
        //receive
        socket.on('data', function (data) {
            let dataStr = data.toString();
            const startReceivingDataMsg = `Data received from client: ${dataStr.length < 50 ? dataStr : (dataStr.slice(0, 20) + '...(skip)')}`;
            console.log(startReceivingDataMsg);
            cmsLib.sendDataLog(startReceivingDataMsg);
            //check format

            if (dataStr.slice(0, 11) === 'excel-name:') {
                excelContent = '';
                excelName = dataStr.slice(11);
            }
            else if (dataStr.slice(0, 9) === 'excel-end') {
                //handleReceivedCsv(excelName, excelContent);
            }
            else {
                excelContent += dataStr;
            }


        });
        //end
        socket.on('end', function () {
            const endMsg = `Closing connection with the client ${clientName}`;
            cmsLib.sendDataLog(endMsg);
            console.log(endMsg);
        });
        //error
        socket.on('error', function (err) {
            const errMsg = `Error(${addressMsg}): ${err}`;
            console.log(errMsg);
            cmsLib.sendErrLog(errMsg);
        });
    });



}
function appendMachineNum(name: string) {
    let currDeviceNum = mainState.kvmTaskManeger.currWaitingCheckParamResultDeviceNum;
    return currDeviceNum === '' ? name : (name + '_' + currDeviceNum);
}

export function processFile(excelPath: string) {
    const startComparingMsg = `接收到Execl檔，已存入${excelPath}，將對其進行參數比對`;
    mainService.logBoth(startComparingMsg);
    paramCheckerLib[excelPath.slice(-4) === 'xlsx' ? 'readXlsxP' : 'readCsvP'](excelPath).then(ws => {

        let rows: any[][] = [];
        let firstRowValues: any[] = [];
        ws.eachRow(function (row, rowNumber) {
            if (firstRowValues.length === 0) firstRowValues = row.values as any;
            rows.push(row.values as any[]);
        });
        //設備編號
        let recipeId = firstRowValues[firstRowValues.indexOf('TYPE DATA') + 1];
        console.log('ID:' + recipeId);
        let task = mainState.kvmTaskManeger.getCurrLoadingCsvTask();
        let stringToPrepend = `\ufeff設備編號,${task.deviceNum}\r\n`;
        let newFilePath = fileSys.renameExcelFile(excelPath, appendMachineNum(recipeId));
        let excelContent = fileSys.readFileSync(newFilePath);

        // paramCheckerLib.copyCheckedFile(excelPath);
        let failMsg = paramCheckerLib.checkExcel(recipeId, rows);


        if (task && task.isLoadingCsv) task.receiveCheckParamResult(failMsg);
        else mainService.logBothErr(`發生異常，接收到參數比對結果卻無對應設備(${task.deviceNum})`);

        if (failMsg === '') {
            stringToPrepend += `檢驗結果,合格\r\n`;
            fileSys.simpleWrite(newFilePath, stringToPrepend + excelContent);
        }
        
        else {
            stringToPrepend += `檢驗結果,不合格\r\n訊息,${failMsg}\r\n`;
            fileSys.simpleWrite(newFilePath, stringToPrepend + excelContent);
            }
        
    })
}