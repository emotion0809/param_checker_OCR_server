import * as child_process from 'child_process';
import * as fs from 'fs';
import { cmsLib } from './cs/cms.server';
import { mainState } from './data/main.state';
import { PromFailErr } from './err-handle';
import { fileSys } from './file-sys.lib';
import { setting } from './setting';
import { resolve } from 'path';
import { existsSync } from 'fs';
import { exec } from 'child_process';

class PsOption {
    constructor(
        public onDataMsgTransformer = (str: string) => str,
        public isShowDataOnReceiving = true,
        public isShowComepleteMsg = true,
    ) { }
}
export let mainService = {
    logBoth(msg: string) {
        console.log(msg);
        cmsLib.sendDataLog(msg);
    },
    logBothErr(msg: string) {
        console.error(msg);
        cmsLib.sendErrLog(msg);
    },
    // 即直接從on接收到的資料
    filterDataFromPs(data: Buffer) {
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
    },
    /**
     * 
     * @param path 
     * @param paramsToPass 
     * @param isShowErrLog 怕有時候Catch會show了這邊又Show
     */
    execFile(path: string, paramsToPass: string[] = [], isShowErrLog = true): Promise<string> {
        return new Promise((res, rej) => {
            // let child=child_process.exec(`powershell.exe`+psScript);
            const toEexcMsg = 'exec: ' + path + (paramsToPass.length === 0 ? '' : `(param:${paramsToPass.join(',')})`);
            console.log(toEexcMsg);
            cmsLib.sendDataLog(toEexcMsg);
            let child = child_process.execFile(path, paramsToPass, function (err, data) {
                if (err === null) {
                    const succMsg = 'success to exec ' + path;
                    mainService.logBoth(succMsg);
                    res(data.toString());
                }
                else {
                    console.log(err);
                    if (isShowErrLog) cmsLib.sendDataLog(err.message);
                    rej(err.message);
                }
                // console.log(data.toString());
            });
        })
    },
    execPowerShellScript(psScript: string, taskName: string = 'powershell script', psOpt: PsOption = new PsOption()): Promise<string[]> {
        return new Promise((res, rej) => {

            let child = child_process.spawn(`powershell.exe`, [psScript],);
            let datas: string[] = [];
            child.stdout.on("data", function (data: Buffer) {
                let dataStr = mainService.filterDataFromPs(data);
                datas.push(dataStr);
                let msg = psOpt.onDataMsgTransformer(dataStr);
                if (psOpt.isShowDataOnReceiving) {
                    console.log(msg);
                    cmsLib.sendDataLog(msg);
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
                cmsLib.sendErrLog(errMsg);

                rej(dataStr)
            });
            child.on("exit", function () {
                const endMsg = `ps task ${taskName} finished`;
                if (psOpt.isShowComepleteMsg) mainService.logBoth(endMsg);
                res(datas);
            });
            child.stdin.end(); //end input
        })
        // psScript = psScript.replace(/(?:\r\n|\r|\n)/g, ' '); //用exec時line-break好像會導致問題(不確定因為搞不出來)，用spawn又不能去空行
        // cmd /c chcp 65001>nul &&  //https://stackoverflow.com/questions/20731785/wrong-encoding-when-using-child-process-spawn-or-exec-under-windows

        // https://stackoverflow.com/questions/14549750/powershell-windows-form-browes-dialogue

        // let child=child_process.exec(`powershell.exe`+psScript);
    },
    execProcAfterReceiveFromIT(recipeName: string, deviceNum: string) {
        mainService.logBoth(`偵測到IT發出的上傳Recipe指令(Recipe名稱：${recipeName}，機台號碼：${deviceNum}`);
        mainState.kvmTaskManeger.registerUploadRecipeTask(recipeName, deviceNum);
    },
    detectRecipeFromIT() {
        let noDirErrMsgCount = 0;
        mainService.logBoth(`監測${setting.listenRecipeTxtFileDrive[0]}碟Recipe txt檔中。`);
        let isFileDetected = false;
        setInterval(() => {
            const txtFiles = fileSys.readDir(setting.listenRecipeTxtFileDrive, '.TXT');
            if (typeof txtFiles === 'string') {
                noDirErrMsgCount++;
                const errMsg = txtFiles;//屬於string時為err msg
                if (noDirErrMsgCount % 10 === 0) {
                    mainService.logBoth(errMsg);
                };
                return;
            }
            //狀態發生變化才進行動作
            if (txtFiles.length !== 0) {
                if (!isFileDetected) {
                    let fileNameWithExt = txtFiles[0];
                    // deviceNumber":"31LD003
                    let deviceNum = fileNameWithExt.slice(0, -4);
                    let txtPath = setting.listenRecipeTxtFileDrive + fileNameWithExt;
                    let txtConent = fileSys.readFileSync(txtPath);
                    let datas = txtConent.split(',');
                    let recipeName = datas[1] ? datas[1] : txtConent;
                    isFileDetected = true;
                    mainService.execProcAfterReceiveFromIT(recipeName, deviceNum);
                    fileSys.copyFile(txtPath, setting.txtHistoryFolder + `/${mainService.getDateString(new Date())}/${fileNameWithExt}`);
                    fileSys.removeFile(txtPath);
                }
            }
            else {
                if (isFileDetected) {
                    mainService.logBoth(`${setting.listenRecipeTxtFileDrive[0]}碟txt檔已清除`);
                    isFileDetected = false;
                }
            }
        }, setting.checkDiskInterval);


    },
    /*
    checkIeWindowExistence(): Promise<boolean> {
        return new Promise((res: (isExist: boolean) => void, rej) => {
            let psScript = `
$processId=Get-Process | Where-Object { ($_.MainWindowTitle) -and ($_.ProcessName -eq "iexplore") }  | Select-Object -ExpandProperty  Id
$processId
if (!$processId) { "nopid" }
`;
            // psScript = psScript.replace(/(?:\r\n|\r|\n)/g, ' '); //用exec時line-break好像會導致問題(不確定因為搞不出來)，用spawn又不能去空行
            // cmd /c chcp 65001>nul &&  //https://stackoverflow.com/questions/20731785/wrong-encoding-when-using-child-process-spawn-or-exec-under-windows

            // https://stackoverflow.com/questions/14549750/powershell-windows-form-browes-dialogue

            // let child=child_process.exec(`powershell.exe`+psScript);
            let child = child_process.spawn(`powershell.exe`, [psScript]);
            child.stdout.on("data", function (data) {
                // console.log(typeof(data));
                data = data + '';//不然原本是物件
                data = data.replace('\n', ''); //實測是取消時會含有1個\n，不過多寫一行檔一下
                data = data.replace('\r\n', '');
                data = data.replace(' ', '');
                res(!(data.slice(0, 5) === 'nopid'));//會是processId，如果沒查到就會回傳pid
            });
            child.stderr.on("data", function (data) {
                //this script block will get the output of the PS script
                console.log("Powershell Errors: " + data);
            });
            child.on("exit", function () {
                if (!isProduction) console.log("checking ie window script finished");
            });
            child.stdin.end(); //end input

        })
    },*/
    /**
     * @param url 同url的會全關
     */
    tryCloseIeWindow(url: string): Promise<string> {
        let psScript = `
# $processId=Get-Process | Where-Object { ($_.MainWindowTitle) -and ($_.ProcessName -eq "iexplore") }  | Select-Object -ExpandProperty  Id   
# 不可用$pid因為是關鍵字會壞掉
# if ($processId) {Stop-Process -Id $processId}

$ie=(New-Object -ComObject "Shell.Application").Windows() | Where-Object { $_.Name -eq "Internet Explorer" -and $_.LocationURL -eq "${url}"}
IF($ie){$ie.Quit()}`;
        return mainService.execPowerShellScript(psScript, 'closing IE').then(datas => datas[0]);
    },
    testConnection(ipArr: string[]): Promise<boolean[]> {

        if (ipArr.length === 0) return Promise.resolve([]);
        const startMsg = 'start testing connections';
        console.log(startMsg);
        cmsLib.sendDataLog(startMsg);
        let psArrStr = '@(' + ipArr.map(ip => `'${ip}'`).join() + ')';
        let psScript = `Test-Connection -Count 2 -Quiet ${psArrStr}`;
        let isConnectionValids: boolean[] = [];

        return mainService.execPowerShellScript(psScript, 'Ip connection testing').then(datas => {
            isConnectionValids = datas.map(data => data === "True" ? true : false);
            return isConnectionValids;
        })
    },
    openSoftwares(absPathes: string[], windowTitleNameToActive: string = '', isMinimized = false) {
        absPathes = absPathes.filter(x => x !== '');//前端沒濾掉最後一個的話會有空字串，會導致後面錯誤
        if (absPathes.length === 0) return;
        absPathes.forEach(path => { mainService.openSoftware(path, windowTitleNameToActive, isMinimized) })
    },
    openSoftware(path: string, windowTitleNameToActive: string = '', isMinimized = false) {
        let psScript = `Start-Process "${path}" ${isMinimized ? '-WindowStyle Minimized' : ''}`;

        if (windowTitleNameToActive !== '') psScript += `
$wshell = New-Object -ComObject wscript.shell
$wshell.AppActivate("${windowTitleNameToActive}")`;

        return mainService.execPowerShellScript(psScript, 'opening software');
    },
    // moveWindowByHandle(handle: number, x: number, y: number, w: number, h: number) {
    //     const taskName = "moving window by handle"
    //     let psScript = `
    //     Set-Location -LiteralPath "${process.cwd()}"
    //     & '${setting.sendKeyScriptFolderPath}by-handle.exe' @(${handle},${x},${y},${w},${h})`;
    //     if (handle === 0) {
    //         const msg = '視窗縮小中，移動失敗';
    //         console.log(msg);
    //         cmsLib.sendErrLog(msg);
    //     }
    //     let child = child_process.spawn(`powershell.exe`, [psScript]);
    //     child.stdout.on("data", function (data) {
    //         let dataStr = mainService.filterDataFromPs(data);
    //         console.log(dataStr);
    //         // cmsLib.sendDataLog(windowCountTip);
    //     });
    //     child.stderr.on("data", function (data) {
    //         //this script block will get the output of the PS script
    //         const errMsg = `err in ${taskName}: ` + data;
    //         console.log(errMsg);
    //         cmsLib.sendErrLog(errMsg);
    //     });
    //     child.on("exit", function () {
    //         const endMsg = `${taskName} Script finished`;
    //         console.log(endMsg);
    //         cmsLib.sendDataLog(endMsg);
    //     });
    //     child.stdin.end(); //end input
    // },
    moveWindowByTitle(title: string, x: number, y: number, w: number, h: number) {
        if (title === '') return;
        let inputs = [x, y, w, h];

        if (inputs.some(input => isNaN(input))) {
            mainService.logBoth('移動KVM視窗數據異常，略過執行：' + `@("${title}",${x},${y},${w},${h})`);
            return;
        }
        let psScript = `
        Set-Location -LiteralPath "${process.cwd()}"
        & '${setting.sendKeyScriptFolderPath}move-win-by-tiitle.exe' @("${title}",${x},${y},${w},${h})`;
        let opt = new PsOption();
        opt.isShowComepleteMsg = false;
        return mainService.execPowerShellScript(psScript, 'moving window by title', opt);
    },
    // activeWin(winName: string) {
    //     const taskName = "actvating window"
    //     let psScript = `
    //     Set-Location -LiteralPath "${process.cwd()}"
    //     & '${setting.sendKeyScriptFolderPath}win-active.exe' @("${winName}")`;
    //     let child = child_process.spawn(`powershell.exe`, [psScript]);
    //     child.stdout.on("data", function (data) {
    //         let dataStr = mainService.filterDataFromPs(data);
    //         console.log(dataStr);
    //         // cmsLib.sendDataLog(windowCountTip);
    //     });
    //     child.stderr.on("data", function (data) {
    //         //this script block will get the output of the PS script
    //         const errMsg = `err in ${taskName}: ` + data;
    //         console.log(errMsg);
    //         cmsLib.sendErrLog(errMsg);
    //     });
    //     child.on("exit", function () {
    //         const endMsg = `${taskName} Script finished`;
    //         console.log(endMsg);
    //         cmsLib.sendDataLog(endMsg);
    //     });
    //     child.stdin.end(); //end input
    // },
    //內建activate，這樣才不會有間隔
    // controlKvmP(winName: string, isLock: boolean): Promise<any> {
    //     return new Promise((res, rej) => {
    //         const taskName = "controlling kvm"
    //         let psScript = `
    //     Set-Location -LiteralPath "${process.cwd()}"
    //     Start-Process '${setting.sendKeyScriptFolderPath}${isLock ? 'kvm-lock' : 'kvm-release'}.exe'  @("${winName}") -Wait`;
    //         let child = child_process.spawn(`powershell.exe`, [psScript]);
    //         child.stdout.on("data", function (data) {
    //             let dataStr = mainService.filterDataFromPs(data);
    //             console.log(dataStr);
    //             // cmsLib.sendDataLog(windowCountTip);
    //         });
    //         child.stderr.on("data", function (data) {
    //             //this script block will get the output of the PS script
    //             const errMsg = `err in ${taskName}: ` + data;
    //             console.log(errMsg);
    //             cmsLib.sendErrLog(errMsg);
    //             res();
    //         });
    //         child.on("exit", function () {
    //             const endMsg = `${taskName} Script finished`;
    //             console.log(endMsg);
    //             cmsLib.sendDataLog(endMsg);
    //             res();
    //         });
    //         child.stdin.end(); //end input
    //     })
    // },
    controlKvmP(winName: string, isLock: boolean): Promise<any> {
        return mainService.execFile(setting.sendKeyScriptFolderPath + (isLock ? 'kvm-lock.exe' : 'kvm-release.exe'), [winName]);
    },
    getNwWindowPositionP(): Promise<number[]> {
        // -50是因為自然展到最大的時候不是0,0，而是-9,-9，所以放寬縮小判定條件（縮小大概-3萬多）
        let psScript = `$nwWindow=Get-Process | Where-Object { $_.ProcessName -eq "nw" -and $_.MainWindowTitle }
$Handle=$nwWindow.MainWindowHandle
$ProcessName=$nwWindow.ProcessName

Add-Type @"
                using System;
                using System.Runtime.InteropServices;
                public class Window {
                [DllImport("user32.dll")]
                [return: MarshalAs(UnmanagedType.Bool)]
                public static extern bool GetWindowRect(IntPtr hWnd, out RECT lpRect);
                }
                public struct RECT
                {
                public int Left;        // x position of upper-left corner
                public int Top;         // y position of upper-left corner
                public int Right;       // x position of lower-right corner
                public int Bottom;      // y position of lower-right corner
                }
"@
$Rectangle = New-Object RECT

$Return = [Window]::GetWindowRect($Handle,[ref]$Rectangle)
            If ($Return) {
                $Height = $Rectangle.Bottom - $Rectangle.Top
                $Width = $Rectangle.Right - $Rectangle.Left
                $Size = New-Object System.Management.Automation.Host.Size -ArgumentList $Width, $Height
                $TopLeft = New-Object System.Management.Automation.Host.Coordinates -ArgumentList $Rectangle.Left, $Rectangle.Top
                $BottomRight = New-Object System.Management.Automation.Host.Coordinates -ArgumentList $Rectangle.Right, $Rectangle.Bottom
                If ($Rectangle.Top -lt -50 -AND $Rectangle.Left -lt -50) {
                    Write-Warning "Window is minimized! Coordinates will not be accurate."
                }
                $Object = [pscustomobject]@{
                    ProcessName = $ProcessName
                    Size = $Size
                    TopLeft = $TopLeft
                    BottomRight = $BottomRight
                }
                $Object.PSTypeNames.insert(0,'System.Automation.WindowInfo')
                $Object.TopLeft.X
                $Object.TopLeft.Y
            }`;
        let psOpt = new PsOption();
        psOpt.isShowDataOnReceiving = false;
        psOpt.isShowComepleteMsg = false;
        let xyArr: number[] = [];
        return mainService.execPowerShellScript(psScript, 'getting nw window position', psOpt).then(datas => {
            xyArr = datas.map(data => Number(data));
            return xyArr
        });
    },
    alignKvmWindows(x: number, y: number, displaceX: number, displaceY: number) {
        let xyArr: number[];
        let titleArr: string[];
        const windowHeaderHeight = 0; //35;
        const deviceNumberH = 30;
        return mainService.getNwWindowPositionP().then(_xyArr => {
            xyArr = _xyArr;
            return mainService.getTitlesOfKvm()
        }).then(title => {
            titleArr = title;
        }).then(() => {
            const nwWinX = xyArr[0];
            const nwWiny = xyArr[1];
            titleArr.forEach((title, i) => {
                let j = i < 2 ? 0 : 1;
                mainService.moveWindowByTitle(title,
                    (nwWinX + x) + (i % 2) * displaceX,
                    (y + nwWiny + windowHeaderHeight + deviceNumberH) + j * displaceY, displaceX, displaceY - deviceNumberH);
            })
        }).catch(err => {
            //這邊報錯太要命了
            mainService.logBoth(err);
        })
    },
    getTitlesOfKvm() {
        return mainState.kvmTaskManeger.queueToShowKvm.map(task => task.kvmWindowName)
    },
    //     getHandlesOfKvms(): Promise<number[]> {
    //         const taskName = "getting kvm handles";
    //         let psScript = `$kvms=Get-Process | Where-Object { ($_.ProcessName -eq "jp2launcher") } 
    // $kvms.MainWindowHandle`;
    //         let handleArr: number[] = [];//晚的會在矩陣前面
    //         let res = (handleArr: number[]) => { }, rej = (str: string) => { };
    //         let child = child_process.spawn(`powershell.exe`, [psScript]);
    //         child.stdout.on("data", function (data) {
    //             let dataStr = mainService.filterDataFromPs(data);
    //             handleArr.push(Number(dataStr));
    //             // cmsLib.sendDataLog(windowCountTip);
    //         });
    //         child.stderr.on("data", function (data) {
    //             //this script block will get the output of the PS script
    //             const errMsg = `err in ${taskName}: ` + data;
    //             console.log(errMsg);
    //             cmsLib.sendErrLog(errMsg);
    //             rej(errMsg);
    //         });
    //         child.on("exit", function () {
    //             const endMsg = `${taskName} Script finished`;
    //             console.log(endMsg);
    //             cmsLib.sendDataLog(endMsg);
    //             res(handleArr);
    //         });
    //         child.stdin.end(); //end input

    //         return new Promise((_res, _rej) => {
    //             res = _res;
    //             rej = _rej;
    //         })

    //     },
    // uploadRecipe(recipeName: string) {
    //     let ai = mainData.automationInfo;
    //     if (Object.keys(ai).some(key => (ai as any)[key] === "")) {
    //         //【ERROR】
    //         cmsLib.sendErrLog('尚未填寫程式路徑，請至Automation設置');
    //         return
    //     }
    //     mainService.openSoftwares([ai.phindowsPath]);
    //     keys.phindowAuth(recipeName).then(() => {
    //         setTimeout(() => {
    //             mainService.openSoftwares([ai.ftttpPath]);
    //             keys.ftttpDU(recipeName);
    //         }, 1000 * 10);
    //     }).catch(console.log);
    // },
    testExeDuration() {
        //powershell用call operator(&)執行exec會瞬間結束，不會等exe作完，但用Start-Process加-Wait可以
        const taskName = "test exec duration"
        let psScript = `
        Set-Location -LiteralPath "${process.cwd()}"
        Start-Process 'build/send-keys/test-duration.exe' -Wait`;

        // console.log('execTime:');
        // console.log(new Date());
        mainService.execPowerShellScript(psScript, taskName).then((datas) => {
            console.log('endTime:');
            console.log(new Date());

        });
    },
    execIEAuth(port: number) {
        let isCrackIEAuthPort = port === 24 ? 1 : 0;
        return mainService.execFile(setting.sendKeyScriptFolderPath + 'ie-auth', [port.toString(), isCrackIEAuthPort.toString()]);
    },
    getOpeningIEUrls() {
        let psScript = `$ies=(New-Object -ComObject "Shell.Application").Windows() | Where-Object { $_.Name -eq "Internet Explorer"}
        $ies.LocationURL`;
        let opt = new PsOption();
        opt.isShowDataOnReceiving = false;
        return mainService.execPowerShellScript(psScript, 'getting opening IE urls', opt);
    },
    closeWindowByTitleP(windowTitle: string) {
        let psScript = `Get-Process | Where-Object { $_.MainWindowTitle -eq "${windowTitle}" } | Stop-Process`;
        return mainService.execPowerShellScript(psScript, 'closing window by title')
    },
    closeWindowByPidP(pid: string) {
        let psScript = `Get-Process | Where-Object { $_.Id -eq "${pid}" } | Stop-Process`;
        return mainService.execPowerShellScript(psScript, 'closing window by pid')
    },
    testPsEncode() {
        let psScript = `THROW '好麻煩'`;
        return mainService.execPowerShellScript(psScript, 'testEncode')
    },
    handleErr(pfe: PromFailErr) {
        PromFailErr.handlePFE(pfe,
            (_pfe) => {
                mainService.logBoth(`----------發生異常----------`);
                mainService.logBoth(`異常步驟：${_pfe.failedTaskName}`);
                if (_pfe.catchedErr) mainService.logBoth(`${_pfe.catchedErr}`);
                if (_pfe.instructionForOuterCatch) mainService.logBoth(`${_pfe.instructionForOuterCatch}`);
                mainService.logBoth(`----------------------------`);
            },
            (err) => {
                mainService.logBoth(`-------發生非預期異常-------`);
                mainService.logBothErr(err.message);
                mainService.logBoth(`----------------------------`);
            }
        )
    },
    openIEWithAuthCheck(url: string, deviceNumber: string, windowPosition: { x: number, y: number }): Promise<OpenIeState> {
        mainService.openIEByVB(url);
        let psScript = `
function Open-IE-WithAuthCheck {
    param (
        [string]$Url
    )

    #$ie = New-Object -com InternetExplorer.Application
    #$ie.visible = $true
    
    #Set-WindowPosition($ie.HWND)
    
    # $ie # show完整資訊
    #$ie.navigate($Url) #這之後馬上寫$ie會壞掉，在這之前是不會（但是$ie.property則不會壞）

    # 會壞的
    #"a1"
    #$ie
    #"a2"

    # 不會壞
    # $ie.HWND
    # $ie.ReadyState

    #start-sleep -m 10   #不夠就會壞
    #start-sleep -m 1000 #夠時間開就不會壞

    # $ie #若給夠時間開好了，這卻已非完整資訊,只是物件名,看來只好用別的方法抓取（不直接沿用$ie）
    # $ie.HWND -eq　$null #True,似乎其他所有屬性都是null


    #一開始是0,成null應該可以視為已經開好
    #"start looping"
    while ($ie.ReadyState -ne $null -and $ie.ReadyState -ne 4) {
        start-sleep -m 10
    };
    #"end looping"

    start-sleep -m 1000 #不等一下好像會抓不到

    $openedIE = (New-Object -ComObject "Shell.Application").Windows() | Where-Object { $_.Name -eq "Internet Explorer" -and $_.LocationURL -eq $Url }
    
    Set-WindowPosition($openedIE.HWND)
    
    # Document操作可參考 https://www.kiloroot.com/powershell-script-to-open-a-web-page-and-bypass-ssl-certificate-errors-2/

    $insecureTitle = "This site isn’t secure"
    $accessibleTitle = "Direct Port Access via URL"

    $title = $openedIE.Document.title
    $titleCount = $title.Count

    if ($titleCount -eq 0) { "ZERO_TITLE" }
    elseif ($titleCount -gt 1) { "MULTI_TITLE" }
    else {
        if ($title -eq $insecureTitle) { "INSECURE" }
        elseif ($title -eq $accessibleTitle) { "OK" }
        else { "UNKNOWN_TITLE" }

    }
}

function Set-WindowPosition {
    param (
        [IntPtr]$Handle
    )

    $d = (Get-WmiObject -Class Win32_VideoController).VideoModeDescription;
    $d = $d -replace ' '
    $arr = $d.Split("x")
    $screenW = [int]$arr[0]
    $screenH = [int]$arr[1]

    $windowW = 600
    $windowH = 300

    $posiX = $screenW - $windowW
    $posiY = $screenH - $windowH

    $setPOS = @'
[DllImport("user32.dll")]
public static extern bool SetWindowPos(IntPtr hWnd, 
IntPtr hWndInsertAfter, 
int X, 
int Y, 
int cx, 
int cy, 
uint uFlags);
'@

    $SetWindowPos = Add-Type -MemberDefinition $setPOS -name WinApiCall -passthru
    $SetWindowPos::SetWindowPos($Handle, -1, ${windowPosition.x}, ${windowPosition.y}, $windowW, $windowH, 0) | Out-Null
}
Open-IE-WithAuthCheck -Url '${url}'`;
        let psOpt = new PsOption();
        psOpt.onDataMsgTransformer = (ieState: string) => `設備${deviceNumber}開啟IE：${ieState}`;
        return mainService.execPowerShellScript(psScript, 'opening ie window', psOpt).then(datas => {
            const ieState: OpenIeState = datas[0] as OpenIeState;
            return ieState;
        })
    },
    openIEByVB(url: string) {
        const urlTxtPath = ".\\OpenIEByVB\\url.txt";
        const vbsPath = resolve('.\\OpenIEByVB\\IE.vbs');
        try {
            fs.writeFileSync(urlTxtPath, url, { encoding: 'utf8' });
            console.log(`文字已成功寫入 ${urlTxtPath}`);
        } catch (error) {
            cmsLib.sendErrLog(`寫入檔案時發生錯誤：${error}`);
        }
        if (!existsSync(vbsPath)) {
            cmsLib.sendErrLog(`檔案不存在: ${vbsPath}`);
            return;
        }
        const command = `cscript //nologo "${vbsPath}"`;
        exec(command, (error, stdout, stderr) => {
            if (error) {
                cmsLib.sendErrLog(`執行錯誤: ${error.message}`);
                return;
            }
    
            if (stderr) {
                cmsLib.sendErrLog(`錯誤輸出: ${stderr}`);
                return;
            }
    
            console.log(`執行結果:\n${stdout}`);
        });
    },
    checkIfWinExistP(winTitle: string) {
        return mainService.execFile(`${setting.sendKeyScriptFolderPath}check-win-exist`, [winTitle]).then(isExist => {
            return Boolean(Number(isExist as '0' | '1'));
        })
    },
    pressEnterAtWindow(winTitle: string) {
        return mainService.execFile(`${setting.sendKeyScriptFolderPath}win-enter`, [winTitle])
    },
    getDateString(d: Date, isNoSeparator = true) {
        const pad = (v: number) => {
            return (v < 10) ? ('0' + v) : v.toString()
        }
        let year = pad(d.getFullYear());
        let month = pad(d.getMonth() + 1)
        let day = pad(d.getDate())
        let hour = pad(d.getHours())
        let min = pad(d.getMinutes())
        let sec = pad(d.getSeconds());
        let firstNumInMilisecond = d.getMilliseconds().toString()[0];
        return isNoSeparator ? (year + month + day + hour + min + sec) :
            (year + '/' + month + '/' + day + ' ' + hour + ':' + min + ':' + sec + '.' + firstNumInMilisecond);

        //YYYY-MM-DD hh:mm:ss
        //return year+"-"+month+"-"day+" "+hour+":"+min+":"+sec

    },
}

// mainService.checkIeWindowExistence();
// let openingIeHWND: string;


// mainService.testExeDuration();

// mainService.testPsEncode();
