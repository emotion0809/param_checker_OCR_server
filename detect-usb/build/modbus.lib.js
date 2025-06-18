"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.modbusLib = void 0;
var modbus_serial_1 = __importDefault(require("modbus-serial"));
var ModbusLib = /** @class */ (function () {
    function ModbusLib() {
        this.client = new modbus_serial_1.default();
        this.connectionTimeoutMs = 20 * 1000;
        /**
         * client.connectRTUBuffered是否正在開啟連線中
         */
        this.isOpening = false;
    }
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
    ModbusLib.prototype.connectRTUBufferedP = function (path, options) {
        var _this = this;
        var eResult = { type: 'FAIL_TO_CONNECT', msg: '' };
        return new Promise(function (res, rej) {
            if (_this.client.isOpen) {
                resolveExecResult('ALREADY_OPENED', "Serial Port".concat(path, " is already opened."));
            }
            else {
                if (_this.isOpening) {
                    resolveExecResult('ALREADY_TRYING_CONNECT', "Already Trying to Connect to ".concat(path, "."));
                }
                else {
                    try {
                        _this.isOpening = true;
                        _this.client.connectRTUBuffered(path, options, function () {
                            _this.isOpening = false;
                            resolveExecResult('SUCCESS_CONNECTED', "Successfully Connected to ".concat(path, "."));
                        });
                        setTimeout(function () {
                            resolveExecResult('FAIL_TO_CONNECT', "fail to Connected to ".concat(path, " cuz timeout(").concat(_this.connectionTimeoutMs / 1000, ")."));
                        }, _this.connectionTimeoutMs);
                    }
                    catch (error) {
                        _this.isOpening = false; // 連線遇拋錯要把已經設為真的此參數還原
                        resolveExecResult('FAIL_TO_CONNECT', error);
                    }
                }
            }
            function resolveExecResult(type, msg) {
                eResult.type = type;
                eResult.msg = msg;
                res(eResult);
            }
        });
    };
    /**
     * 類似讀取記憶體，從某位址往後讀幾位(legnth)。
     * @param id 以DTM溫控模組為例，即是站號（應是RS485站號）
     * @param dataAddress
     * @param length
     */
    ModbusLib.prototype.readHoldingRegisters = function (id, dataAddress, length) {
        if (id === void 0) { id = 1; }
        if (dataAddress === void 0) { dataAddress = 0x0268; }
        if (length === void 0) { length = 0x0004; }
        this.client.setID(id);
        return this.client.readHoldingRegisters(dataAddress, length).then(function (msg) { return msg; });
    };
    return ModbusLib;
}());
exports.modbusLib = new ModbusLib();
