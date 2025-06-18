var net = require('net');
console.log(123)
//create server
let server = net.createServer();
//start server with a port to listen to
server.listen(8001, function () {
    console.log('TCP Server start')
});

//main connection event, will return a connection i.e. socket
server.on('connection', function (socket) {
    console.log('A new connection has been established.');
    vmzLib.vmzSocket = socket;
    cmsLib.tellVmzConnectingState(true);

    //write
    socket.write('Hello, client.');

    //receive
    socket.on('data', function (data) {
        let dataStr = data.toString();
        if ('dooropen' === dataStr) {
            mainState.isPause;//不會繼續作下去
            //告知前端已經暫停，但實際上此步因為沒有在taskQueue中拋出錯誤，所以正在執行的動作還是會完成，
            //而進入下一個index，當前端按繼續，就是繼續此index的事情，流程上正確。
            cmsLib.sendErrLog(dataStr);
        } else vmzLib.resolveFunc(dataStr);//送資料給reqVmz的promise回傳值
        console.log(`Data received from vmz client: ${dataStr}.`);

    });

    //end
    socket.on('end', function () {
        console.log('Closing connection with the client');
        cmsLib.tellVmzConnectingState(false);
    });

    //error
    socket.on('error', function (err) {
        cmsLib.sendErrLog(typeof err === 'string' ? err : 'vmz異常');
        mainState.isPause = true;
        console.log(`Error: ${err}`);
    });
});