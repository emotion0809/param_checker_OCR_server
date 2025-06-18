import { fileSys } from "../file-sys.lib"
import { setting } from "../setting"

export class WebSet {
    id: string = '網頁組1'
    webUrlObjs: WebUrlObj[] = [];//通常會有個空的，要自己過濾一下
}

export class WebUrlObj {
    url: string = '';
    deviceNumber: string = '';
}
type MainDataBackeys = 'paramSets' | 'managementPassword' | 'webSets' | 'webSwitchSecondObj' | 'ips' | 'initialPrograms' | 'automationInfo';

export class Device {
    deviceNumber = '';
    recipe = '';
    isUploadingRecipe = false;
    isNormalProcessing = false;
}

class MainDataBack {
    // params: Param[] = []; //後台就不用寫定義了，因為都在前台完成操作
    paramSets: ParamSet[] = []
    managementPassword = 'autohhcparam';
    webSets: WebSet[] = [new WebSet()];
    webSwitchSecondObj = {
        waitOcrResponse: 10,
        notToCheckParam: 3,
        waitToCheckParam: 12,
        waitAfterCheckSucc: 70,
        waitAfterCheckFail: 5,
        execNextWebsiteInterval: 7,
    };
    ips: string[] = ['google.com'];
    ieWindowPosition = { x: 0, y: 500 };
    initialPrograms: InitProgramInfo[] = [];
    automationInfo = { ftttpPath: '', phindowsPath: '' }
    devices: Device[] = createDevices(300);
    testmode = true;
}
let folderName = setting.systemDataFolder;
let mainDatafilePath = `${folderName}/${setting.systemDataFileName}`;

export let mainData: MainDataBack = loadMainData();

function loadMainData(): MainDataBack {
    let loadedObj = fileSys.readAsJson(mainDatafilePath, new MainDataBack());
    //讀進來的檔案有可能是舊資料，幫新增新資料的屬性
    let md = new MainDataBack();
    Object.keys(md).forEach(_key => {
        let key: MainDataBackeys = _key as any;
        if (loadedObj[key] === undefined) loadedObj[key] = (md)[key];
        // 於根屬性下補新的屬性
        else {
            if (key === 'webSwitchSecondObj') {
                if (loadedObj[key].execNextWebsiteInterval === undefined) {
                    loadedObj[key].execNextWebsiteInterval = md.webSwitchSecondObj.execNextWebsiteInterval;
                }
            }
        }
    });
    return loadedObj as MainDataBack
}

export function saveMainData() {
    fileSys.writeAsJson(mainDatafilePath, mainData);
}

export interface Param {
    name: string;
    upperBound: number;
    lowerBound: number;
}

export class ParamSet {
    id: string = '';
    params: Param[] = []
}

export function reloadMainData() {
    mainData = loadMainData();
}


export class InitProgramInfo {
    path: string = '';
    windowTitle: string = ''
}



function createDevices(count = 48) {
    let arr = [];
    for (let index = 0; index < count; index++)  arr.push(new Device());
    return arr
}