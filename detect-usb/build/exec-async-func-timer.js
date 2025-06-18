"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecAsyncFuncTimer = void 0;
var ExecAsyncFuncTimer = /** @class */ (function () {
    /**
     * 定間隔執行async funciton（執行完才會重新計算間隔）。
     * 跟setInterval的差別是，此功能會等非同步的函數完成後，才繼續計時。
     * @param interval async函數結束後到再次開始執行async函數的間隔毫秒。
     * @param asyncCallback
     * @param isKeepExecAfterErr 真時就算發生錯誤也會繼續執行。預設為否。可動態更動。
     */
    function ExecAsyncFuncTimer(interval, asyncCallback, isKeepExecAfterErr) {
        if (isKeepExecAfterErr === void 0) { isKeepExecAfterErr = false; }
        this.interval = interval;
        this.asyncCallback = asyncCallback;
        this.isKeepExecAfterErr = isKeepExecAfterErr;
        this.p = Promise.resolve();
    }
    /** 開始定期執行async func。第一次會直接執行，不會等待。 */
    ExecAsyncFuncTimer.prototype.start = function () {
        // stop過的話為rejected狀態，所以要重新更新為resolved。
        this.p = Promise.resolve();
        this.exec();
    };
    /** 循環執行 */
    ExecAsyncFuncTimer.prototype.exec = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        // this.p只有掛asyncCallback，不會掛後面的間隔等待。這樣的好處是insertAsyncTask掛上的時候不用等到間隔等待結束才執行。
                        this.p = this.p.then(this.asyncCallback);
                        return [4 /*yield*/, this.p];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, new Promise(function (res) { return setTimeout(res, _this.interval); })];
                    case 2:
                        _a.sent();
                        this.exec();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        console.log(error_1);
                        if (this.isKeepExecAfterErr) {
                            this.p = Promise.resolve(); // 要記得重置，否則發生錯誤時基本上this.p是rejected，會在這邊形成無限迴圈
                            this.exec();
                        }
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ExecAsyncFuncTimer.prototype.stop = function (stopMsg) {
        if (stopMsg === void 0) { stopMsg = 'stop ExecAsyncFuncTimer'; }
        this.p = Promise.reject(stopMsg);
    };
    /** 以排隊的方式插入到asyncCallback的循環執行中。 */
    ExecAsyncFuncTimer.prototype.insertAsyncTask = function (asyncCallback) {
        var _p = this.p.then(asyncCallback);
        this.p = _p;
        return _p;
    };
    return ExecAsyncFuncTimer;
}());
exports.ExecAsyncFuncTimer = ExecAsyncFuncTimer;
