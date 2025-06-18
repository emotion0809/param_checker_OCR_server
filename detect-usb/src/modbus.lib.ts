import ModbusRTU from "modbus-serial";
import { SerialPortOptions } from "modbus-serial/ModbusRTU";

class ModbusLib {
    client = new ModbusRTU();
    connectionTimeoutMs = 20 * 1000;
    /**
     * client.connectRTUBuffered是否正在開啟連線中
     */
    isOpening = false;
    /**
     * 以RTU協定連線至序列埠。
     * 只要是預期內的狀況不論連線成功失敗或者不允許連續連線，都會以resolve的方式回傳結果，此處沒Handle到的才會Reject。
     * 
     * PS：已經透過connectRTUBuffered開過後，再次呼叫（例如隔個幾秒）會產生PortNotOpenError（此時client.isOpen===false），
     * 　　而這種因為連開所導致的PortNotOpenError一旦發生，就無法再開起來。
     * 　　要完善防止連開，要防止
     *         1.已經開啟的狀態不可再開 => check this.client.isOpen
     *         2.正在開（此時client.isOpen應該是false），還沒開完時也不能連著呼叫 => check this.isOpening
     * @param path 
     * @param options 
     */
    connectRTUBufferedP(
        path: string, options: SerialPortOptions
    ): Promise<ExecResult> {

        let eResult: ExecResult = { type: 'FAIL_TO_CONNECT', msg: '' };

        return new Promise<ExecResult>((res, rej) => {
            if (this.client.isOpen) {
                resolveExecResult('ALREADY_OPENED', `Serial Port${path} is already opened.`);
            }
            else {
                if (this.isOpening) {
                    resolveExecResult('ALREADY_TRYING_CONNECT', `Already Trying to Connect to ${path}.`);
                }
                else {
                    try {
                        this.isOpening = true;
                        this.client.connectRTUBuffered(path, options, () => {
                            this.isOpening = false;
                            resolveExecResult('SUCCESS_CONNECTED', `Successfully Connected to ${path}.`);
                        });
                        setTimeout(
                            () => {
                                resolveExecResult('FAIL_TO_CONNECT', `fail to Connected to ${path} cuz timeout(${this.connectionTimeoutMs / 1000}).`);
                            },
                            this.connectionTimeoutMs
                        );
                    }
                    catch (error) {
                        this.isOpening = false; // 連線遇拋錯要把已經設為真的此參數還原
                        resolveExecResult('FAIL_TO_CONNECT', error);
                    }
                }

            }
            function resolveExecResult(type: ExecResultType, msg: string) {
                eResult.type = type;
                eResult.msg = msg;
                res(eResult);
            }
        })

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

type ExecResultType = 'ALREADY_OPENED' | 'ALREADY_TRYING_CONNECT' | 'SUCCESS_CONNECTED' | 'FAIL_TO_CONNECT';
interface ExecResult {
    type: ExecResultType;
    msg: string;
}
export const modbusLib = new ModbusLib();