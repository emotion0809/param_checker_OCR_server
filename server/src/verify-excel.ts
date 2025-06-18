
import * as net from 'net';
import { setting } from './setting';

let excelPath = process.argv[2];
let port = setting.listenExcelPathPort;
var socket = net.createConnection(port);
socket.on('connect', () => {
    console.log('verify-excel starts.');
    console.log('excel path: ' + excelPath);

    socket.write('start,' + excelPath);

    socket.on('data', (data: any) => {
        let dataStr = data.toString();
        console.log(dataStr);
        if (dataStr == 'OK') console.log('參數上下限檢測合格');
        else console.log('ERROR:參數超出上下限或遺漏參數');
        console.log('檢測結束，可以關閉視窗...');
    });
})