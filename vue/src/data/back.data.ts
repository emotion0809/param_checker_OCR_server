export class MainDataBack {
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
    devices: Device[] = [];
}
export class WebSet {
    id: string = '網頁組1'
    webUrlObjs: WebUrlObj[] = [];
}
export let backData: MainDataBack = new MainDataBack()

export interface WebSwitchSecondObj {
    waitOcrResponse: number,
    notToCheckParam: number,
    waitToCheckParam: number,//其實是等待校對結果的時間
    waitAfterCheckSucc: number,
    waitAfterCheckFail: number,
    execNextWebsiteInterval: number,
}
export class MachineConfig {
    constructor(public settingName: string = '', public armSpeed: number | null = null, public partConfigs: PartConfig[]) { }
    public isUsing = false;
    public id = new Date().getTime();
}
export class PartConfig {
    constructor(public partName: string, public axisInfo: AxisInfo, public operationOrder: number) { }
}
export class AxisInfo {
    constructor(public x: number | null = null, public y: number | null = null, public z: number | null = null) { }
}
export class ParamSet {
    id: string = '';
    params: Param[] = []
}
export class Param {
    name: string = '';
    upperBound: number | null = null;
    lowerBound: number | null = null;
    // createTimeStamp:number=new Date().getTime()
}
export class WebUrlObj {
    url: string = '';
    deviceNumber: string = '';
}


export class InitProgramInfo{
    path:string='';
    windowTitle:string=''
}

export class Device {
    deviceNumber = '';
    recipe = '';
    isUploadingRecipe = false;
    isNormalProcessing = false;
  }
  
