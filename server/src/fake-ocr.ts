import * as net from 'net';
import { setting } from './setting';

//create server
let serverForParamCheck = net.createServer();
let portIndex = Number(process.argv[2]);

let port = setting.ocrPortsForParamCheck[portIndex];
let ocrNum = portIndex + 1;
let isDetecting = Number(process.argv[3]);

console.log(process.argv);

//start server with a port to listen to
serverForParamCheck.listen(port, function () {
    let msg = `Fake OCR${ocrNum} starts. Check screen ${ocrNum} at port:${port}.`;
    console.log(msg);
});

//main connection event, will return a connection i.e. socket
serverForParamCheck.on('connection', function (socket) {
    let succMsg = 'A connection from param check has been established.'
    console.log(succMsg);
    //write
    // socket.write('Hello, client.');
    detect = () => { write(`auto${ocrNum}`) };
    //receive
    socket.on('data', function (data) {
        let dataStr = data.toString().replace('\r\n', '');;
        console.log(dataStr);

        if ('detectusb' === dataStr) {
            if (isDetecting) write(`auto${ocrNum}`)
        }
        else  if ('dev-detected' === dataStr) {
            write(`auto${ocrNum}`)
        }

    });

    //end
    socket.on('end', function () {
        let msg = 'OCR disconnected.';
        console.log(msg);
    });

    //error
    socket.on('error', function (err) {
        // cmsLib.sendErrLog(msg);
        console.log(`Error: ${err}`);
    });

    function write(str: string) {
        socket.write(str);
        console.log('writes: ' + str);
    }
});


let detect = () => { }