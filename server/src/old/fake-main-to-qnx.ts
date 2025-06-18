// https://stackoverflow.com/questions/43042889/typescript-referenceerror-exports-is-not-defined
exports = {}; //要自己去編譯出來的js再往上提一、兩行

import * as net from 'net';
import { setting } from '../setting';

class SwitchAdapterObj {
    allDeviceNumbers = ['31LD001']
    constructor(public recipeName: string, public deviceNumber: string) {
    }
}

let qnxLib = {
    isSocketAlive: false,
    socket: null as net.Socket | null,
    isUploadingRecipe: false,
    uploadRecipeRes: (msg: string) => { },
    uploadRecipeRej: (msg: string) => { },
    tellUploadRecipeInfoP(recipeName: string, deviceNum: string): { isTold: boolean, prom: Promise<void> } {
        let returnObj = {
            isTold: false,
            prom: Promise.resolve(),
        };
        if (!qnxLib.isSocketAlive || !qnxLib.socket) {
            const msg = `偵測到Recipe：${recipeName}，但因未與Qnx連線，上傳Recipe作業取消`;
            console.log(msg);
            return returnObj;
        }
        if (qnxLib.isUploadingRecipe) {
            const msg = 'Qnx上傳Recipe中，請稍後再重新嘗試';
            console.log(msg);
            return returnObj;
        }
        qnxLib.socket.write('switch-adpater-obj' + JSON.stringify(new SwitchAdapterObj(recipeName, deviceNum)));
        returnObj.isTold = true;
        returnObj.prom = new Promise((res, rej) => {
            qnxLib.uploadRecipeRes = res as any;
            qnxLib.uploadRecipeRej = rej as any;
        }).then(() => {
            qnxLib.isUploadingRecipe = false;
        }).catch(err => {
            qnxLib.isUploadingRecipe = false;
            console.log(err);
            return Promise.reject()
        });

        qnxLib.isUploadingRecipe = true;
        return returnObj;
    },
    serve() {
        let port = setting.listenQnxPort;
        //create server
        let server = net.createServer();
        //start server with a port to listen to
        server.listen(port, function () {
            const msg = `TCP Server start. Waiting for Qnx at port:${port}.`;
            console.log(msg);
        });

        //main connection event, will return a connection i.e. socket
        server.on('connection', function (socket) {
            let succMsg = 'A connection to QNX server has been established.';
            console.log(succMsg);
            qnxLib.socket = socket;
            qnxLib.isSocketAlive = true;
            console.log('可使用test(recipeName,deviceNumber)作測試')
            //write
            //  socket.write('Hello, client.');

            //receive
            socket.on('data', function (data: Buffer) {
                let dataStr = data.toString();
                console.log(dataStr);
                if ('finish-uploading-recipe' === dataStr) {
                    qnxLib.uploadRecipeRes('Qnx端上傳Recipe完成');
                }
                else if ('failed-to-recipe' === dataStr) {
                    qnxLib.uploadRecipeRej('Qnx端上傳Recipe失敗');
                }
            });

            //end
            socket.on('end', function () {
                let msg = '連線結束';
                console.log(msg);
                qnxLib.isSocketAlive = false;
            });

            //error
            socket.on('error', function (err) {
                let msg = typeof err === 'string' ? err : '與Qnx連線中斷';
                qnxLib.isSocketAlive = false;
                console.log(`Error: ${msg}`);
            });
        });
    }
}

let  test=qnxLib.tellUploadRecipeInfoP

qnxLib.serve();