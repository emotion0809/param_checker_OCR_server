var net = require('net');
console.log(net)
var socket = net.createConnection(8124);
socket.on('connect',()=>{
    socket.write('hi');
    socket.on('data',(data)=>{console.log(data.toString())});
    socket.end();
})