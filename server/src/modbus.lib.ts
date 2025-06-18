import ModbusRTU from "modbus-serial";
import { SerialPortOptions } from "modbus-serial/ModbusRTU";

class ModbusLib {
    client = new ModbusRTU();
    /**
     * client.connectRTUBuffered是否正在開啟連線中
     */
    isOpening = false;
    /**
     * 
     * PS：已經透過connectRTUBuffered開過後，再次呼叫（例如隔個幾秒）會產生PortNotOpenError（此時client.isOpen===false），
     * 　　而這種因為連開所導致的PortNotOpenError一旦發生，就無法再開起來。
     * 　　要完善防止連開，要防止
     *         1.已經開啟的狀態不可再開 => check this.client.isOpen
     *         2.正在開（此時client.isOpen應該是false），還沒開完時也不能連著呼叫 => check this.isOpening
     * @param path 
     * @param options 
     * @param next 
     * @param onAlarm
     */
    connectRTUBuffered(
        path: string, options: SerialPortOptions, next: Function = () => { },
        onAlarm: (msg: string) => void = (msg) => { }
    ) {
        if (this.client.isOpen) {
            onAlarm('Serial Port is already opened.');
        }
        else {
            if (this.isOpening) {
                onAlarm('Already Trying to Connect.')
            }
            else {
                try {
                    this.isOpening = true;
                    this.client.connectRTUBuffered(path, options, () => {
                        this.isOpening = false;
                        next();
                    });
                    // client.connectRTU(setting.comportName, { baudRate: setting.baudrate }, startReading);
                }
                catch (error) {
                    this.isOpening = false; // 連線遇拋錯要把已經設為真的此參數還原
                    onAlarm(error);
                }
            }

        }
    }
    /**
     * 類似讀取記憶體，從某位址往後讀幾位(legnth)。
     * @param id 以DTM溫控模組為例，即是站號（應是RS485站號）
     * @param dataAddress 
     * @param length 
     */
    readHoldingRegisters(id = 1, dataAddress: number = 0x0268, length: number = 0x0004) {
        this.client.setID(id);
        return this.client.readHoldingRegisters(dataAddress, length).then(msg => msg)
    }
}

export const modbusLib = new ModbusLib();





