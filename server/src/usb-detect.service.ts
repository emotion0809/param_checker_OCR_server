import { fileSys } from "./file-sys.lib";




/** 因為MainServie有cmsLib的dependency，就在此檔創一個Usb-Detection專用的。 */
class Service {
    /**
     * 為字串填充字元至指定長度，若字串超過指定長度則原樣返回。
     * @param str 字串
     * @param padding 欲填充之字元（限1個，否則拋錯），例如個位數9要填充至百位，則此處填'0'
     * @param lengthToMeet 欲達到之字串長度，如個位數要填充至百位數，則為3
     * @param isPaddingLeft 是否填左，預設為真
     * @returns 
     */
    pad(str: string, padding: string, lengthToMeet: number, isPaddingLeft = true) {
        if (padding.length !== 1) throw 'padding長度須為1';
        if (str.length >= lengthToMeet) return str;
        else {
            const repeatedPadding = padding.repeat(lengthToMeet - str.length);
            return isPaddingLeft ? (repeatedPadding + str) : (str + repeatedPadding);
        };
    }
    /**
     * 依照給定的格式返回時間資訊。
     * @param date Date
     * @param pattern 年Y月M日D時h分m秒s，毫秒三位依序為[ms1]、[ms2]、[ms3]。ex: 'Y/M/D h:m:s.[ms1]', 'YMDhms', 's.[ms1][ms2][ms3]'
     * @returns as your pattern
     */
    getFormattedDate(date: Date, pattern = 'Y/M/D h:m:s.[ms1]') {
        /** 補成十位數 */
        const tensDigitPad = (number: number) => {
            return this.pad(number.toString(), '0', 2);
        }
        /** 補成百位數 */
        const hundredsDigitPad = (number: number) => {
            return this.pad(number.toString(), '0', 3);
        }

        let year = tensDigitPad(date.getFullYear()); //Y
        let month = tensDigitPad(date.getMonth() + 1);//M
        let day = tensDigitPad(date.getDate());//D
        let hour = tensDigitPad(date.getHours());//h
        let min = tensDigitPad(date.getMinutes());//m
        let sec = tensDigitPad(date.getSeconds());//s
        let msStr = hundredsDigitPad(date.getMilliseconds()); // use [ms1][ms2][ms3] to specify 731、091、001 etc

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
    }
    /** console.log + 存於log檔 */
    logBoth(msg: string) {
        console.log(msg);
        let msgWithTime = `${this.getFormattedDate(new Date)} ${msg}`;
        let dateId = this.getFormattedDate(new Date, 'YMD');
        fileSys.saveIntoLog(msgWithTime, undefined, dateId);
    }
    /** 1 indexed => [1, 2, 3, ..., n] */
    GetArrOfN(n: number) {
        return Array.from(Array(n), (e, i) => i + 1);
    }
}

export let service = new Service();

class ChannelInfo {
    constructor(public name: string) { }
    isAsTemperatureParam = true;
    channelValueUnit = '°C';
}
export class TemperatureSetting {
    setName: string = '[Temperature Values]'
    channelInfos: ChannelInfo[] = service.GetArrOfN(8).map(n => 'channel' + n).map(channelName => new ChannelInfo(channelName));
}