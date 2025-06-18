interface ResponseObj {
    status: number;
    payload: any //非200則為錯誤訊息
}

interface RespObj {
    isErr: boolean;
    msg: string
}

type OpenIeState = 'ZERO_TITLE' | 'MULTI_TITLE' | 'INSECURE' | 'OK' | 'UNKNOWN_TITLE';

interface KvmContainerInfo {
    xDisplace: number,
    yDisplace: number,
    x: number,
    y: number,
}
// export class ExecResult {
//     constructor(public isSuccess: boolean, public msg: string | null = null) {
//     }

// }