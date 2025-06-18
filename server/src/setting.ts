import { isProduction } from "./is-production";

export let setting = {
    // connectionTimeout: 90 * 1000,
    hostCmsPort: 8083,
    listenExcelPathPort: 8084,
    checkParamHostPort: 8085,
    systemDataFolder: 'system-data',
    systemDataFileName: isProduction ? 'sys.sav' : 'sys-dev.sav',
    checkedExcelFolderName: 'AllData',
    checkDiskInterval: 100,
    diskToCheck: 'F:\\',
    excelFileNames: ['DATA_DT.xlsx', 'DATA_DT.csv'],
    // successKeys: ['control', 'control', 'S'],
    // failKeys: ['control', 'control', 'P'],
    sendKeyScriptFolderPath: './send-keys/',
    delayAfterExcelName: 500,
    delayAfterExeclContent: 500,
    ocrPortsForParamCheck: [8025, 8026, isProduction ? 8027 : 8030, 8028],
    fakeDriveForSimulation: 'T:\\',
    hostToWaitCheckParamResultPort: 8026,
    listenRecipeTxtFileDrive: 'D:\\hp9000\\',// 'Z:\\MIS\\',
    listenQnxPort: 8090,
    uploadRecipeTimeoutSecond: 60 * 15,
    calibrateDeviceTimeoutSecond: 60 * 30,//30分
    waitKvmWindowTimeoutSecond: 15,
    isSwithchingNetAdapter: true,
    ieSwitchIntervalSecond: 10,//10秒
    ieExePath: 'C:\\Program Files\\Internet Explorer\\iexplore.exe',
    txtHistoryFolder: 'recipe-txt-history'
}


