type DataName = 'users' |'logs';

type ServerEvent='SET_AS_DEFAULT_MACHINESEETING';

interface ResponseObj {
    status: number;
    payload: any //非200則為錯誤訊息
}

interface RespObj {
    isErr: boolean;
    msg: string
}

interface SwitchWebExecption{
    msg:string;
    rollbackCount:number;
}

interface DevInfo { type: DevType, data: any }

type DevType='傳送比對結果'|'OCR偵測';