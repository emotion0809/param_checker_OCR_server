import * as net from 'net';
// @ts-ignore
// import readXlsxFile from 'read-excel-file/node';
import { cmsLib } from '../cs/cms.server';
import { fileSys } from '../file-sys.lib';
import { mainData, reloadMainData } from '../data/main.data';
import { setting } from '../setting';

import ExcelJS from 'exceljs';
// import { default as readXlsxFile } from 'read-excel-file';


export let paramCheckerLib = {
    paramCheckerSocket: null as net.Socket | null,
    isSocketAlive: false,
    resolveFunc: (() => { }) as any,
    readXlsxP: (path: string) => {
        let workbook = new ExcelJS.Workbook();
        return workbook.xlsx.readFile(path).then(workbook => workbook.getWorksheet(1));
    },
    readCsvP: (path: string) => {
        let workbook = new ExcelJS.Workbook();
        return workbook.csv.readFile(path);
    },
    // readXlsxFile: readXlsxFile,
    checkExcel(id: string, rows: any[][]): string | '' {
        reloadMainData();
        let errMsg = ''; //都若無發現錯誤則最後回傳的會是空字串
        let paramSet = mainData.paramSets.find(set => set.id === id);
        if (!paramSet) return '錯誤：無相符的參數組ID';
        outer:
        for (let k = 0; k < paramSet.params.length; k++) {
            const p = paramSet.params[k];
            let isFound = false;
            let isInBounds = false;
            inner:
            for (let j = 0; j < rows.length; j++) {
                const entries = rows[j];

                for (let i = 0; i < entries.length; i++) {
                    if (entries[i] === p.name) {
                        isFound = true;
                        if (p.upperBound >= entries[i + 1] && p.lowerBound <= entries[i + 1]) isInBounds = true;
                        break inner; //一旦找到了 就跳出 若既存在又合乎上下限就繼續找  否則終止迴圈並報錯
                    }
                }

            }
            if (!isFound) errMsg += `未含有${p.name}參數，`;
            else if (!isInBounds) errMsg += `${p.name}數值超出上下限，`;

            // if (errMsg) break outer;
        }
        if (errMsg) errMsg = errMsg.slice(0, -1);//去逗號
        return errMsg;
    },
    copyCheckedFile(sourcePath: string): string {
        let fileName = sourcePath.slice(sourcePath.lastIndexOf('\\') + 1);
        fileSys.makeIfNoDir(setting.checkedExcelFolderName);
        let destinationPath = setting.checkedExcelFolderName + '\\' + fileName;
        fileSys.copyFile(sourcePath, destinationPath);
        return destinationPath;
    }
}


export class ParamCheckResult {
    isSucc: boolean = false;
    msg: string = '';
    constructor() { }
}