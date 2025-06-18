"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};

var modbus_serial_1 = __importDefault(require("modbus-serial"));
try {

    var client = new modbus_serial_1.default();
    client.connectRTUBuffered("COM6", { baudRate: 9600 }, read);

    function write() {
        client.setID(1);
        // 0103 0268 00085BC4
        // write the values 0, 0xffff to registers starting at address 5
        // on device number 1.
        client.writeRegisters(5, [0, 0xffff])
            .then(read);
    }

    function read() {
        client.setID(1);
        // read the 2 registers starting at address 5
        // on device number 1.
        client.readHoldingRegisters(0x0268, 0x0004)
            .then(msg => {
                console.log(msg);
                setTimeout(() => {
                    read()
                }, 1000);

            });


    }

} catch (error) {
    console.log(error)
}

setInterval(() => { }, 300)



// try {
//     var serialport_1 = __importDefault(require("serialport"));
//     var port = new serialport_1.default('COM6');


//     port.on('open', function () {
//         port.write('0103026800085BC4', function (err) {
//             if (err) {
//                 return console.log('Error on write: ', err.message);
//             }
//             console.log('message written');
//         });
//     });
// // hi 沒用~
//     port.on('error', function (err) {
//         console.log('Error: ', err.message)
//     })
//     // http://hk.uwenku.com/question/p-utaxzria-vp.html

//     port.on('readable', function () {
//         console.log('Data:', port.read())
//     })

//     // Switches the port into "flowing mode"
//     port.on('data', function (data) {
//         console.log('Data:', data)
//     })
// } catch (error) {
//     console.log(error)
// }


/*
const buf = Buffer.from('runoob', 'ascii');
console.log(buf)
console.log(buf.toString('hex'));
let b=Buffer.alloc(3)
console.log(b)
b.writeUInt8(255);
console.log(b)
setInterval(()=>{},300)
*/
