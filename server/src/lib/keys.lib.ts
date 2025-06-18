import { mainService } from "../main-service"
import { setting } from "../setting"

export let keys = {
    succ: (windowTitle: string) => mainService.execFile(setting.sendKeyScriptFolderPath + 'succ32.exe',[windowTitle]),
    fail: (windowTitle: string) => mainService.execFile(setting.sendKeyScriptFolderPath + 'fail32.exe',[windowTitle]),
    loadCsv: (windowTitle: string) => mainService.execFile(setting.sendKeyScriptFolderPath + 'load-csv.exe',[windowTitle],false),
    cancelAuto: (windowTitle: string) => mainService.execFile(setting.sendKeyScriptFolderPath + 'cancel-auto.exe',[windowTitle],false),
    // ftttpU: (msg = '') => mainService.execFile(setting.sendKeyScriptFolderPath + 'ftttpU.exe', msg),
    // ftttpDU: (msg = '') => mainService.execFile(setting.sendKeyScriptFolderPath + 'ftttpDU.exe', msg),
    // phindowAuth: (msg = '') => mainService.execFile(setting.sendKeyScriptFolderPath + 'phindows.exe', msg),
}
