"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemperatureSetting = exports.service = void 0;
var file_sys_lib_1 = require("./file-sys.lib");
/** 因為MainServie有cmsLib的dependency，就在此檔創一個Usb-Detection專用的。 */
var Service = /** @class */ (function () {
    function Service() {
    }
    /**
     * 為字串填充字元至指定長度，若字串超過指定長度則原樣返回。
     * @param str 字串
     * @param padding 欲填充之字元（限1個，否則拋錯），例如個位數9要填充至百位，則此處填'0'
     * @param lengthToMeet 欲達到之字串長度，如個位數要填充至百位數，則為3
     * @param isPaddingLeft 是否填左，預設為真
     * @returns
     */
    Service.prototype.pad = function (str, padding, lengthToMeet, isPaddingLeft) {
        if (isPaddingLeft === void 0) { isPaddingLeft = true; }
        if (padding.length !== 1)
            throw 'padding長度須為1';
        if (str.length >= lengthToMeet)
            return str;
        else {
            var repeatedPadding = padding.repeat(lengthToMeet - str.length);
            return isPaddingLeft ? (repeatedPadding + str) : (str + repeatedPadding);
        }
        ;
    };
    /**
     * 依照給定的格式返回時間資訊。
     * @param date Date
     * @param pattern 年Y月M日D時h分m秒s，毫秒三位依序為[ms1]、[ms2]、[ms3]。ex: 'Y/M/D h:m:s.[ms1]', 'YMDhms', 's.[ms1][ms2][ms3]'
     * @returns as your pattern
     */
    Service.prototype.getFormattedDate = function (date, pattern) {
        var _this = this;
        if (pattern === void 0) { pattern = 'Y/M/D h:m:s.[ms1]'; }
        /** 補成十位數 */
        var tensDigitPad = function (number) {
            return _this.pad(number.toString(), '0', 2);
        };
        /** 補成百位數 */
        var hundredsDigitPad = function (number) {
            return _this.pad(number.toString(), '0', 3);
        };
        var year = tensDigitPad(date.getFullYear()); //Y
        var month = tensDigitPad(date.getMonth() + 1); //M
        var day = tensDigitPad(date.getDate()); //D
        var hour = tensDigitPad(date.getHours()); //h
        var min = tensDigitPad(date.getMinutes()); //m
        var sec = tensDigitPad(date.getSeconds()); //s
        var msStr = hundredsDigitPad(date.getMilliseconds()); // use [ms1][ms2][ms3] to specify 731、091、001 etc
        return pattern
            .replace(/\[ms1\]/g, msStr[0])
            .replace(/\[ms2\]/g, msStr[1])
            .replace(/\[ms3\]/g, msStr[2])
            .replace(/Y/g, year)
            .replace(/M/g, month)
            .replace(/D/g, day)
            .replace(/h/g, hour)
            .replace(/m/g, min)
            .replace(/s/g, sec);
    };
    /** console.log + 存於log檔 */
    Service.prototype.logBoth = function (msg) {
        console.log(msg);
        var msgWithTime = "".concat(this.getFormattedDate(new Date), " ").concat(msg);
        var dateId = this.getFormattedDate(new Date, 'YMD');
        file_sys_lib_1.fileSys.saveIntoLog(msgWithTime, undefined, dateId);
    };
    /** 1 indexed => [1, 2, 3, ..., n] */
    Service.prototype.GetArrOfN = function (n) {
        return Array.from(Array(n), function (e, i) { return i + 1; });
    };
    return Service;
}());
exports.service = new Service();
var ChannelInfo = /** @class */ (function () {
    function ChannelInfo(name) {
        this.name = name;
        this.isAsTemperatureParam = true;
        this.channelValueUnit = '°C';
        this.userSpecifiedTemperatureConstant = 0;
    }
    return ChannelInfo;
}());
var TemperatureSetting = /** @class */ (function () {
    function TemperatureSetting() {
        this.setName = '[Temperature Values]';
        this.channelInfos = exports.service.GetArrOfN(8).map(function (n) { return 'channel' + n; }).map(function (channelName) { return new ChannelInfo(channelName); });
    }
    return TemperatureSetting;
}());
exports.TemperatureSetting = TemperatureSetting;
