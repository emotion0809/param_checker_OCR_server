import * as net from 'net';
// // @ts-ignore
// import readXlsxFile from 'read-excel-file/node';
import { cmsLib } from "./cms.server";
import { paramCheckerLib } from "../lib/param-checker.lib";
import { setting } from '../setting';
import { fileSys } from '../file-sys.lib';
import { mainService } from '../main-service';

export function hostTestExeclFileServer() {

    let port = setting.listenExcelPathPort;

    //create server
    let server = net.createServer();
    //start server with a port to listen to
    server.listen(port, function () {
        console.log(`TCP Server start. Waiting for excel path at port:${port}.`)
    });

    //main connection event, will return a connection i.e. socket
    server.on('connection', function (socket) {
        let succMsg = 'A connection to receive excel path has been established.'
        console.log(succMsg);
        cmsLib.sendDataLog(succMsg);
        paramCheckerLib.paramCheckerSocket = socket;
        paramCheckerLib.isSocketAlive = true;

        //write
        // socket.write('Hello, client.');

        //receive
        socket.on('data', function (data) {
            let dataStr = data.toString().replace('\r\n', '');;
            console.log(dataStr);

            if ('start,' === dataStr.slice(0, 6)) {
                let path = dataStr.slice(6);

                paramCheckerLib[path.slice(-4) === 'xlsx' ? 'readXlsxP' : 'readCsvP'](path).then(ws => {
                    let pathToSave = paramCheckerLib.copyCheckedFile(path);
                    let rows: any[][] = [];
                    let firstRowValues: any[] = [];
                    ws.eachRow(function (row, rowNumber) {
                        if (firstRowValues.length === 0) firstRowValues = row.values as any;
                        rows.push(row.values as any[]);
                    });

                    let id = firstRowValues[firstRowValues.indexOf('TYPE DATA') + 1];
                    console.log('ID:' + id);
                    fileSys.renameExcelFile(pathToSave, id);
                    let errMsg = paramCheckerLib.checkExcel(id, rows);
                    if (errMsg === '') {
                        socket.write('OK');
                        console.log('檢驗合格');
                    }
                    else {
                        socket.write('Parameter Error');
                        console.log(errMsg);
                    }
                })

                // socket.write('excel path received.');
            }
            else paramCheckerLib.resolveFunc(dataStr);//送資料給reqParamChecker的promise回傳值

        });

        //end
        socket.on('end', function () {
            let msg = '連線結束';
            console.log(msg);
            cmsLib.sendDataLog(msg);
            paramCheckerLib.isSocketAlive = false;
        });

        //error
        socket.on('error', function (err) {
            let msg = typeof err === 'string' ? err : '與excel路徑傳輸連線中斷';
            // cmsLib.sendErrLog(msg);
            paramCheckerLib.isSocketAlive = false;
            console.log(`Error: ${err}`);
        });
    });
}


