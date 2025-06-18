/*

import { paramCheckerLib } from "./paramCheckerLib";
import { FileSys } from "./fileSys";
import { setting } from "./setting";
import { isProduction } from "./isProduction";
import { mainService } from "./main-service";
import { keys } from "./keys";

//回傳promise的函數陣列

console.log('程序開始...');
console.log(`監測${setting.diskToCheck[0]}碟加載情況中。`)

let isDiskDetected = false;

setInterval(() => {

    if (!isProduction) console.log(FileSys.checkExistence(setting.diskToCheck));

    //狀態發生變化才進行動作
    if (FileSys.checkExistence(setting.diskToCheck)) {
        if (!isDiskDetected) {
            console.log(`偵測到${setting.diskToCheck[0]}碟，進行參數比對`);
            isDiskDetected = true;

            let excelPaths = setting.excelFileNames.map(name => setting.diskToCheck + name);
            let excelPath: string = '';
            if (excelPaths.every(path => {
                let isExist = FileSys.checkExistence(path);
                if (isExist) excelPath = path;
                return isExist === false
            })) {
                console.log('無法在以下路徑找到excel檔：' + JSON.stringify(excelPaths));
                return
            }

            console.log(`對${excelPath}進行參數比對`);

            paramCheckerLib[excelPath.slice(-4) === 'xlsx' ? 'readXlsxP' : 'readCsvP'](excelPath).then(ws => {

                let rows: any[][] = [];
                ws.eachRow(function (row, rowNumber) {
                    rows.push(row.values as any[]);
                });
                paramCheckerLib.copyCheckedFile(excelPath);
                let errMsg = paramCheckerLib.checkExcel(rows);
                if (errMsg === '') {
                    console.log('參數檢驗結果：合格');
                    keys.succ();
                }
                else {
                    console.log(errMsg);
                    console.log('參數檢驗結果：不合格');
                    keys.fail();
                }
            })

        }
    } else {
        if (isDiskDetected) {
            console.log(`${setting.diskToCheck[0]}碟已卸除`);
            isDiskDetected = false;
        }
    }
}, setting.checkDiskInterval)



if (!isProduction) {
    mimicReloadingDisk();
    setInterval(() => {
        keys.succ();
        setTimeout(() => {
            keys.fail();
        }, 5000);
    }, 10000);
}

function mimicReloadingDisk() {
    let _disk = '';
    setTimeout(() => {
        _disk = setting.diskToCheck
        setting.diskToCheck = 'Z:\\';
        setTimeout(() => {
            setting.diskToCheck = _disk;
        }, 10000);
    }, 3000);
}

*/