// import * as net from 'net';
// import { setting } from '../setting';
// import { cmsLib } from "../cs/cms.server";

// // param result server
// export const prsLib = {
//     socket: null as net.Socket | null,
//     isSocketAlive: false,
  
//     hostServerToListenCheckParamResult() {
//         //create server
//         let server = net.createServer();
//         //start server with a port to listen to
//         server.listen(setting.hostToWaitCheckParamResultPort, function () {
//             const msg=`TCP Server start. Waiting for param check result at port:${setting.hostToWaitCheckParamResultPort}.`;
//             console.log(msg);
//             cmsLib.sendDataLog(msg);
//         });

//         //main connection event, will return a connection i.e. socket
//         server.on('connection', function (socket) {
//             let succMsg = 'A connection from param check result has been established.'
//             console.log(succMsg);
//             prsLib.socket = socket;
//             prsLib.isSocketAlive = true;

//             //receive
//             socket.on('data', function (data) {
//                 let dataStr = data.toString().replace('\r\n', '');;
//                 console.log(dataStr);
//                 if ('succ' === dataStr) cmsLib.tellParamCheckResult(true);
//                 else if ('fail' === dataStr) cmsLib.tellParamCheckResult(false);
               
//             });

//             //end
//             socket.on('end', function () {
//                 console.log('連線結束');
//             });

//             //error
//             socket.on('error', function (err) {
//                 console.log(`Error: ${err}`);
//             });
//         });
//     },
//     write(strNoBr: string, prefixDescription: string = '(Send to main-no-tcpip): ') {
//         if (!prsLib.isSocketAlive) {
//             console.log('未與主程式(no-tcpip)連線');
//             return;
//         }

//         let lineBreak = '\r\n';

//         if (strNoBr.includes(lineBreak)) {

//             // let strWithBr='a\r\nb\r\nc\r\nd'; // 成4行
//             // let replaced = strWithBr.replace(new RegExp(lineBreak, 'g'), ''); // "abcd"

//             console.log(`Alert: there shouldn't be line breaks in Remote commands, including ${strNoBr}`);
//             strNoBr = strNoBr.replace(new RegExp(lineBreak, 'g'), ''); //清光lineBreak;
//         }
//         prsLib.socket?.write(strNoBr);// 基本上已經非null了

//         // 呈現
//         let textToConsole = prefixDescription + strNoBr;
//         // cmsLib.sendDataLog(textToConsole);
//         console.log(textToConsole);
//     },
// }
