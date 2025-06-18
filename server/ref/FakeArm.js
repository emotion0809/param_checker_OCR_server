var net = require('net');

let pErr = 0.2;
let pStatErr = 0.2;

//for reference only
let inputStr = [
    'STAT',
    'SGRP A',
    'MAP a',
    'RSR',
    'GET A, 6',
    'PUT D, 1',
    'GET D, 1',
    'MTCS E',
    'PUT F, 1',
    'GET F, 1',
    'PUT A, 6'
];

//create server
var server = net.createServer();
//start server with a port to listen to
server.listen(8001, function () {
    console.log('TCP Server start')
});

server.on('connection', function (socket) {
    console.log('A new connection has been established.');

    //receive
    socket.on('data', function (data) {
        let data = data.toString();
        let len = data.length;
        console.log(`Data received from client: ${data}.`);
        //check format
        if (!data.includes('\r\n')) { }
        //stat
        else if (data.slice(0, 4) == 'STAT') {
            if (Math.random() > pStatErr) write('9999');
            else write('0000');
        }
        //SGRP
        else if (data.slice(0, 4) == 'SGRP') {
            if (data.slice(-1) == 'A') {
                console.log('4inch');
                write('>');
            }
            else if (data.slice(-1) == 'B') {
                console.log('6inch');
                write('>');
            }
            else write('?');
        }
        //MAP
        else if (data.slice(0, 3) == 'MAP') {
            let t = data.slice(-1);
            if (t == 'a' || t == 'b' || t == 'c') {
                console.log('mapped ' + t);
                write('>');
            }
            else write('?');
        }
        //RSR
        else if (data.slice(0, 3) == 'RSR') {
            console.log('got mapping data');
            write('01011');
        }
        //MTCS
        else if (data == 'MTCS E') {
            console.log('MTCS moved to E');
            write('>');
        }
        //GET and PUT
        else if (data.slice(0, 3) == 'GET' || data.slice(0, 3) == 'PUT') {
            if (data[4] == 'B' || data[4] == 'B' || data[4] == 'C') {
                console.log('moved to ' + data[4]);
                console.log(data.slice(0, 3) + ' ' + data[7]);
                write('>');
            }
            else write('?');
        }
    });
    //end
    socket.on('end', function () {
        console.log('Closing connection with the client');
    });
    //error
    socket.on('error', function (err) {
        console.log(`Error: ${err}`);
    });
});
function write(mes) {
    setTimeout(() => {
        if (Math.random() > pErr) mes = '?';
        socket.write(mes + '\r\n');
    }, 300);
}