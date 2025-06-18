var net = require('net');


//create server
var server = net.createServer();
//start server with a port to listen to
server.listen(8124, function () {
    console.log('TCP Server start')
});

//main connection event, will return a connection i.e. socket
server.on('connection', function (socket) {
    console.log('A new connection has been established.');

    //write
    socket.write('Hello, client.');

    //receive
    socket.on('data', function (data) {
        console.log(`Data received from client: ${data.toString()}.`);
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