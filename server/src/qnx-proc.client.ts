import * as child_process from 'child_process';
import * as fs from 'fs';
import * as net from 'net';
import { fileSys } from "./file-sys.lib";
import { setting } from "./setting";
import http from 'http';
import path from 'path';
// 注意上述lib不可使用cmsLib，因為這樣會破壞只這4個檔就能運作的結構

const deviceIP = '192.168.1.91';
const isOnlyResponseToServer = false;

console.log(`等待Recipe上傳指令中...`)
const tryCheckConnectionTimes = 6;
const ip = fileSys.readFileSyncWithDefaultStr('../ip.txt', 'localhost');
const phindowsPath = fileSys.readFileSyncWithDefaultStr('../phindows-path.txt', String.raw`C:\Users\FATCHHC6\Desktop\瑞薩機器軟體\PHINDOWS\PHINDOWS.EXE`);
const ffftpPath = fileSys.readFileSyncWithDefaultStr('../ffftp-path.txt', String.raw`C:\Users\FATCHHC6\Desktop\瑞薩機器軟體\FFFTP\FFFTP.exe`);
const dt_csvPath = '../typedata/data_dt.csv';
const checkConnectionT = 5000;
// connectToMain();
setInterval(connectToMain, checkConnectionT);

// console.log(`${setting.isSwithchingNetAdapter ? '已開啟' : '未開啟'}網路介面卡切換功能。`);

// if (setting.isSwithchingNetAdapter) {
//     console.log('此版本須確保最初執行時，所有連接機台的網路介面卡皆停用，否則會因不知道要幫忙關哪隻而不關，而導致對機台有多重連線');
//     console.log('此版本尚無上傳前連線檢查');
// }

const PORT = 3000;

const server = http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/get-csv') {
        let body = '';

        req.on('data', (chunk) => {
        body += chunk;
        });

        req.on('end', () => {
            getCSV(body, res);
        });
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

server.listen(PORT, () => {
  console.log(`B電腦 HTTP Server 運作中：http://localhost:${PORT}`);
});

async function getCSV(body: string, res: http.ServerResponse) {
    try {
        let switchAdapterObj: SwitchAdapterObj = JSON.parse(body);
        let deviceNum = switchAdapterObj.deviceNumber;
        await ConnectMachineAdapter(switchAdapterObj.allDeviceNumbers,deviceNum)
        await execFile('./exec/get_data_dt.exe');
        await new Promise(res => setTimeout(res, 30000));

        // 根據傳入參數選擇不同檔案（可自行擴充）
        const filePath = path.join(__dirname, dt_csvPath);

        fs.stat(filePath, (err, stats) => {
            if (err) {
                res.writeHead(404);
                res.end('CSV 檔案不存在');
            return;
            }
            res.writeHead(200, {
                'Content-Type': 'text/csv',
                'Content-Disposition': 'attachment; filename="original.csv"',
                'Content-Length': stats.size,
            });
            const readStream = fs.createReadStream(filePath);
            readStream.pipe(res);
        });
    } catch (e) {
        res.writeHead(400);
        res.end('無效的 JSON 資料');
    }
}

function connectToMain() {
    if (isConnected) return;
    
    const serverName = 'HHC ACSI';
    let port = setting.listenQnxPort;
    console.log(`Trying to connect to ${serverName} where port=${port} and ip=${ip}`);
    socket = net.createConnection(port, ip);
    socket.on('connect', () => {
        isConnected = true;
        console.log(`connected to ${serverName}.`);
        socket.on('data', (data: Buffer) => {
            let dataStr = data.toString();
            console.log(dataStr);
            if (dataStr.slice(0, 18) === 'switch-adpater-obj') {
                let json = dataStr.slice(18);
                let switchAdapterObj: SwitchAdapterObj = JSON.parse(json);
                let recipeName = switchAdapterObj.recipeName;
                let deviceNum = switchAdapterObj.deviceNumber;
                // console.log(switchAdapterObj)
                getOpeningDeviceAdapaterNamesP(switchAdapterObj.allDeviceNumbers).then(deviceNumbersToDisable => {
                    if (!isOnlyResponseToServer) {
                        //關閉已開之adapters
                        new Promise<void>((res, rej) => {
                            if (setting.isSwithchingNetAdapter) {
                                let msDelayToCloseAdapter = 4000;
                                let pAll = [new Promise(res => setTimeout(res, msDelayToCloseAdapter))];
                                deviceNumbersToDisable.forEach(devivceNumberFromPs => {
                                    console.log('關閉已開啟之網路介面卡:' + devivceNumberFromPs);
                                    pAll.push(switchNetAdapter(devivceNumberFromPs, false));
                                })
                                Promise.all(pAll).then(() => res()).catch(rej);
                            }
                            else res();
                            //開啟adapter
                        }).then(() => {
                            if (setting.isSwithchingNetAdapter) {
                                let msDelayToOpenAdapter = 25 * 1000;
                                let pAll = [new Promise(res => setTimeout(res, msDelayToOpenAdapter)), switchNetAdapter(deviceNum, true)];
                                console.log(`開啟${deviceNum}網路介面卡，請等候約25秒才會進行上傳Recipe作業`);
                                return Promise.all(pAll).then();
                            }
                            //檢查連線
                        }).then(() => {
                            return checkConnectionLoopP(deviceNum, tryCheckConnectionTimes).then(isConnected => {
                                if (isConnected) {
                                    console.log(`${deviceNum}已正常連接，將進行phindows與ffftp流程`);
                                }
                                else {
                                    console.log(`${deviceNum}未正常連接，取消phindows與ffftp流程`);
                                    return Promise.reject();
                                }
                            })
                            //phindows流程
                        }).then(() => execFile('./exec/phindows-qnx.exe', [phindowsPath]
                            //稍作間隔
                        ).then(() => new Promise((res) => setTimeout(res, 1000 * 10))
                            //ffftp流程
                        ).then(
                            () => execFile('./exec/ffftpDU-qnx.exe', [ffftpPath, recipeName, deviceNum])
                            //回報完成
                        ).then(
                            () => {
                                socket.write('finish-uploading-recipe');
                            })
                            //回報失敗
                        ).catch(err => {
                            console.log(err);
                            console.log(`上傳Recipe流程失敗`);
                            socket.write('failed-to-recipe');
                        });
                    }
                    else {
                        setTimeout(() => {
                            const succP = 0.7;
                            socket.write(Math.random() <= succP ? 'finish-uploading-recipe' : 'failed-to-recipe');
                        }, 8000)
                    }
                })
            }
        });
    })
    socket.on('end', function () {
        isConnected = false;
        console.log("連線結束");
    });
    socket.on('error', function (err) {
        isConnected = false;
        console.log("Error: " + err.message);
        console.log("try to reconnect within 10s.")
    })
}

function reconnectAndSendEndSignal() {
    setTimeout(() => { // 延遲 500ms，確保 TCP 緩衝區已經清空
        if (socket.writable) {
            console.log('Sending DownloadCSV_End signal...');
            socket.write("DownloadCSV_End");
        } else {
            console.log('Socket is not writable. Retrying...');
            reconnectAndSendEndSignal();
        }
    }, 500);
}

let isConnected = false;
let socket: net.Socket;

function execFile(path: string, paramsToPass: string[] = []): Promise<string> {
    return new Promise((res, rej) => {
        // let child=child_process.exec(`powershell.exe`+psScript);

        const toEexcMsg = 'exec: ' + path + (paramsToPass.length === 0 ? '' : `(param:${paramsToPass.join(',')})`);
        console.log(toEexcMsg);
        let child = child_process.execFile(path, paramsToPass, function (err, data) {
            if (err === null) {
                const succMsg = 'success to exec ' + path;
                res(succMsg);
                console.log(succMsg);
            }
            else {
                console.log(err);
                rej(err.message);
            }
            // console.log(data.toString());
        });
    })
}

class PsOption {
    constructor(
        public onDataMsgTransformer = (str: string) => str,
        public isShowDataOnReceiving = true,
    ) { }
}
function execPowerShellScript(psScript: string, taskName: string = 'powershell script', psOpt: PsOption = new PsOption()): Promise<string[]> {
    return new Promise((res, rej) => {

        let child = child_process.spawn(`powershell.exe`, [psScript],);
        let datas: string[] = [];
        child.stdout.on("data", function (data: Buffer) {
            let dataStr = filterDataFromPs(data);
            datas.push(dataStr);
            let msg = psOpt.onDataMsgTransformer(dataStr);
            if (psOpt.isShowDataOnReceiving) {
                console.log(msg);
            }
        });
        // child.stderr.setEncoding('binary')
        child.stderr.on("data", function (data: Buffer) {
            // console.log(data.constructor)
            // console.log(data instanceof Buffer)
            // console.log('starts here');
            // console.log(data)
            let dataStr = data.toString();
            const errMsg = `err in ps task ${taskName}: ` + dataStr;
            console.log(errMsg);

            rej(dataStr)
        });
        child.on("exit", function () {
            const endMsg = `ps task ${taskName} finished`;
            console.log(endMsg);
            res(datas);
        });
        child.stdin.end(); //end input
    })
    // psScript = psScript.replace(/(?:\r\n|\r|\n)/g, ' '); //用exec時line-break好像會導致問題(不確定因為搞不出來)，用spawn又不能去空行
    // cmd /c chcp 65001>nul &&  //https://stackoverflow.com/questions/20731785/wrong-encoding-when-using-child-process-spawn-or-exec-under-windows

    // https://stackoverflow.com/questions/14549750/powershell-windows-form-browes-dialogue

    // let child=child_process.exec(`powershell.exe`+psScript);
}
// 即直接從on接收到的資料
function filterDataFromPs(data: Buffer) {
    const isShowInfoInConsole = false;
    if (isShowInfoInConsole) console.log(data);//Buffer
    if (isShowInfoInConsole) console.log(data.constructor.name);//Buffer
    let dataStr = data.toString(); //不然原本是物件
    if (isShowInfoInConsole) console.log(dataStr.length);//3
    dataStr = dataStr.replace('\n', ''); //實測是取消時會含有1個\n，不過多寫一行檔一下
    if (isShowInfoInConsole) console.log(dataStr.length);//2
    dataStr = dataStr.replace(String.fromCharCode(13), '');
    if (isShowInfoInConsole) console.log(dataStr.length);//1
    return dataStr
}

function switchNetAdapter(adapterName: string, isEnable: boolean) {
    const disableCmd = `Disable-NetAdapter`, enableCmd = `enable-NetAdapter`;
    if (adapterName === '') return Promise.resolve();

    const psScript = `$myHereString = '${isEnable ? enableCmd : disableCmd} "${adapterName}" -Confirm:$false'
Start-Process powershell -Verb runAs -ArgumentList @($myHereString)`

    return execPowerShellScript(psScript, 'switching adapter');
}

class SwitchAdapterObj {
    allDeviceNumbers: string[] = [];
    constructor(public recipeName: string, public deviceNumber: string) { }
}

// let bool = true;
// setInterval(() => {
//     bool = !bool;
//     switchNetAdapter('ABCD', bool)
// }, 4000)


function getOpeningDeviceAdapaterNamesP(allDeviceNumbers: string[]): Promise<string[]> {
    const psScript = `
$deviceNumbers=@(${allDeviceNumbers.map(dn => '"' + dn + '"').join(',')})
$devicesToDisable=@()
$adapters=Get-NetAdapter
ForEach($adptr in $adapters)
{
if($deviceNumbers -match $adptr.Name -and $adptr.Status -ne "Disabled"){
    $devicesToDisable+=$adptr.Name}
}
$ofs = ',' # after this all casts work this way until $ofs changes!
"$devicesToDisable"`;
    return execPowerShellScript(psScript, 'get opening device adapters').then(datas => {
        let devicesToDisableStr = datas[0];
        return devicesToDisableStr.split(',');
    });
};

function checkConnectionLoopP(deviceNumber: string, loopNum = 6): Promise<boolean> {
    console.log(`將測試${deviceNumber}連線...(尚有${loopNum}次嘗試機會)`)
    return checkDeviceIsConnectedP().then(isConnected => {
        if (isConnected) return true;
        else if (loopNum > 0) return checkConnectionLoopP(deviceNumber, loopNum - 1);
        else return false;
    })
}

// function checkDeviceIsConnectedP(deviceNumber: string): Promise<boolean> {
//     const psScript = `
// $adptr=Get-NetAdapter '${deviceNumber}'
// $adptr.Status`;
//     return execPowerShellScript(psScript, 'check device connection').then(datas => {
//         let dataStr = datas[0];
//         return dataStr === 'Up' ? true : false
//     });
// };

function checkDeviceIsConnectedP(): Promise<boolean> {
    let succCount = 0;
    let succThreshold = 4;
    console.log(`進行ping測試，連續收到封包${succThreshold}次才視為成功。`)

    return testP();
    function testP(): Promise<boolean> {
        return testConnectionP(deviceIP).then(isPingSucc => {
            if (isPingSucc) {
                succCount++;
                console.log(`ping成功-${succCount}`);
                if (succCount === succThreshold) return true;
                else return testP();
            }
            else {
                console.log(`ping失敗`);
                return false;
            }
        })
    }
}

function testConnectionP(ip: string): Promise<boolean> {
    const startMsg = 'start testing connection';
    console.log(startMsg);
    let psScript = `Test-Connection -Count 1 -Quiet '${ip}'`;
    return execPowerShellScript(psScript, 'Ip connection testing').then(datas => {
        let isAnyPingSucc = datas[0] === "True" ? true : false
        return isAnyPingSucc;
    })
}

async function ConnectMachineAdapter (deviceNumbersToDisable: string[],deviceNum: string){
    if (isOnlyResponseToServer) return;
    if (setting.isSwithchingNetAdapter) {
        const msDelayToCloseAdapter = 4000;
        console.log(`等待 ${msDelayToCloseAdapter}ms 後關閉舊網卡...`);
        await new Promise(res => setTimeout(res, msDelayToCloseAdapter));
        for (const oldDeviceNum of deviceNumbersToDisable) {
            console.log(`關閉已開啟之網路介面卡: ${oldDeviceNum}`);
            await switchNetAdapter(oldDeviceNum, false);
        }
    }
    if (setting.isSwithchingNetAdapter) {
        const msDelayToOpenAdapter = 30000;
        console.log(`等待 ${msDelayToOpenAdapter}ms 後開啟網卡 ${deviceNum}，準備上傳 Recipe`); 
        await new Promise(res => setTimeout(res, msDelayToOpenAdapter));
        await switchNetAdapter(deviceNum, true);
    }
    const isConnected = await checkConnectionLoopP(deviceNum, tryCheckConnectionTimes);
    if (!isConnected) {
        console.warn(`${deviceNum} 未正常連接，取消下載流程`);
        return Promise.reject();
    }
    console.log(`${deviceNum} 已正常連接，準備執行 Csv 下載流程`);
}
// setTimeout(() => { getOpeningDeviceAdapaterNamesP(['31LD001','31LD002']).then(console.log) }, 1000)