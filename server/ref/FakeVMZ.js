var net = require('net');

let pNg = 0.5;
//for reference only
let inputStr = ['getstation', 'startw', 'starto', 'startv']; //w=wheel, o=orc, v=vmz
let outputStr = ['A4B6C0', 'WaferID123', 'finish', 'ng', 'dooropen'];

var socket = net.createConnection(8124);
socket.on('connect', () => {
    setTimeout(() => {
        socket.write('dooropen'); //dooropen
    }, 100000 * Math.random());
    socket.on('data', (data) => {
        data = data.toString();
        console.log(data);
        if (data == 'getstation') socket.write(output('A4B6C0')); //station
        if (data == 'startw') socket.write(output('finish')); //finish wheel
        if (data == 'starto') socket.write(output('WaferID123')); //wafer id
        if (data == 'startv') socket.write(output('finish')); //finish
    });
})
function output(mes) {
    if (Math.random() > pNg) return mes;
    else return 'ng';
}