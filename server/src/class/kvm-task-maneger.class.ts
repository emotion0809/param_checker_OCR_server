import { cmsLib } from "../cs/cms.server";
import { handleReceivedCsv } from "../cs/main-no-tcpip-check-param.server";
import { ocrLib } from "../cs/ocr.client";
import { qnxLib } from "../cs/qnx.server";
import { mainData } from "../data/main.data";
import { mainState } from "../data/main.state";
import { PromFailErr } from "../err-handle";
import { keys } from "../lib/keys.lib";
import { ParamCheckResult } from "../lib/param-checker.lib";
import { mainService } from "../main-service";
import { setting } from "../setting";



handleReceivedCsv

class KvmTask {
    positionIndex: number = 99;//理論上進KVM畫面後都是0~3
    birthDate: Date = new Date();
    //--- load csv related
    static loadCsvProcessName = 'Load-Csv';
    isLoadingCsvDone = false; //直到接收到參數結果才算成功
    isLoadingCsv = false;
    isLoadingCsvFailed = false;
    isCsvFileloaded = false;
    isWithLoadCsvTask = false;

    //--- ie 
    isOpenIECalled = false;
    isKvmOpened = false;
    isIESafelyOpened = false;
    isKvmShowLongEnoughAndRemovable = false; //1.ie開完、kvm開一下子後 
    isDestroyed = false;

    //--- recipe
    isUploadingRecipe = false;
    isWithUploadRecipeTask = false;
    isUploadRecipeTaskDone = false;
    recipeNameToUpload = '';


    get canTriggerLoadCsvProcedure() {
        return !this.isDestroyed && !this.isLoadingCsv && ((!this.isLoadingCsvDone && !this.isLoadingCsvFailed) || mainData.testmode)
    }
    paramCheckResult: null | ParamCheckResult = null;
    ieOpenTimeSpend = setting.ieSwitchIntervalSecond * 1000;
    showKvmDuration = 8 * 1000;
    waitParamCheckResultT = 180 * 1000;
    kvmWindowName = '';
    port: number;
    ieOpenRes = () => { };
    ieFailToOpenRej = () => { };
    succToWaitParamResultRes = () => { };
    ieOpenedProm = Promise.all([
        new Promise<void>((res, rej) => {
            this.ieOpenRes = res;
            this.ieFailToOpenRej = rej;
        }),
        new Promise(res => setTimeout(res, setting.ieSwitchIntervalSecond * 1000))//整個流程不可短於這秒數
    ])
    constructor(public deviceNum: string, public url: string) {
        let parts = url.split('port=');
        this.port = Number(parts[1].slice(0, parts[1].indexOf('&')));
        this.kvmWindowName = `Dominion_KX3_Port${this.port}`;
    }
    get lifeSpanInMS() { return new Date().getTime() - this.birthDate.getTime() }
    get canBeReplaced() {
        return this.isLoadingCsvDone || this.isKvmShowLongEnoughAndRemovable || this.isLoadingCsvFailed || this.isDestroyed
    }
    openIEWithAuthCheck() {
        if (this.isOpenIECalled) {
            mainService.logBothErr('已嘗試開啟IE過，不可執行第二次');
            return;
        }
        this.isOpenIECalled = true;

        let onIeOpenedSafely = () => {
            this.isIESafelyOpened = true;
            this.ieOpenRes();

            let id = setInterval(() => {
                mainService.checkIfWinExistP(this.kvmWindowName).then(isExist => {
                    if (isExist) {
                        this.isKvmOpened = true; //稍微早設為true應該ok
                        ocrLib.sockets[this.positionIndex]?.write('detectusb');
                        clearInterval(id);
                        if (this.isWithUploadRecipeTask) {
                            this.screenControl(true);
                            this.uploadRecipe()
                        }
                        setTimeout(
                            () => {
                                if (!this.isWithLoadCsvTask) this.isKvmShowLongEnoughAndRemovable = true;
                            }, this.showKvmDuration
                        );
                    }
                })
            }, 1000)

            setTimeout(() => {
                if (!this.isKvmOpened) {
                    mainService.logBothErr(`異常：IE安全開啟卻未等到KVM視窗出現，此任務單元${this.deviceNum}結束`);
                    clearInterval(id);
                    this.destroy();
                }
            }, setting.waitKvmWindowTimeoutSecond * 1000)


            // 如果有要上傳recipe，則有timeout
            setTimeout(() => {
                if (!this.isDestroyed) {
                    //不能寫在外面，因為有可能後來才變成有task
                    if (this.isWithUploadRecipeTask && !this.isUploadRecipeTaskDone) {
                        mainService.logBothErr(`編號${this.deviceNum}設備上傳Recipe超時（timeout：${setting.uploadRecipeTimeoutSecond / 60}分鐘）`);
                        this.screenControl(false).then(() => this.destroy()).catch(() => this.destroy());
                    }
                }
            }, setting.calibrateDeviceTimeoutSecond * 1000);
            // 如果有要校機，則有timeout
            setTimeout(() => {
                if (!this.isDestroyed && !this.isCsvFileloaded) {
                    //不能寫在外面，因為有可能後來才變成有task
                    if (this.isWithLoadCsvTask && !mainData.testmode) {
                        mainService.logBothErr(`編號${this.deviceNum}設備校機超時（timeout：${setting.calibrateDeviceTimeoutSecond / 60}分鐘）`);
                        this.screenControl(false).then(() => this.destroy()).catch(() => this.destroy());
                    }
                }
            }, setting.calibrateDeviceTimeoutSecond * 1000);
        }

        let handleIeOpening: () => Promise<any> =
            // 免得遇到有重複開的問題（可能會遇到啥port share的錯誤）
            () => mainService.tryCloseIeWindow(this.url).then(() =>
                mainService.openIEWithAuthCheck(this.url, this.deviceNum, mainData.ieWindowPosition).then(
                    ieStatus => {
                        if (ieStatus === 'OK') {
                            const errWinName = 'Error: Error';
                            return new Promise(res => setTimeout(res, 2000)).then(() => {
                                return mainService.checkIfWinExistP(errWinName);
                            }).then(isErrWinExist => {
                                if (isErrWinExist) {
                                    mainService.logBoth(`偵測到${errWinName}視窗，IE開啟失敗`);
                                    return mainService.pressEnterAtWindow(errWinName).then(() => {
                                        this.destroy();
                                        this.ieFailToOpenRej();
                                    });
                                }
                                else onIeOpenedSafely();
                            })
                        }
                        else if (ieStatus === 'MULTI_TITLE') {
                            mainService.logBoth(`偵測到IE重複開啟（${this.url}），將關閉該url之所有視窗後重新嘗試開啟IE`);
                            return mainService.tryCloseIeWindow(this.url).then(() => new Promise(res => setTimeout(res, 3000))).then(handleIeOpening);
                        }
                        else if (ieStatus === 'ZERO_TITLE') {
                            mainService.logBoth(`已嘗試開啟${this.url}的IE分頁，但未偵測到該分頁，3秒後將重新嘗試開啟`);
                            return new Promise(res => setTimeout(res, 3000)).then(handleIeOpening);
                        }
                        else if (ieStatus === 'UNKNOWN_TITLE') {
                            mainService.logBoth(`IE開啟分頁名稱異常，請洽相關人員排除`);
                            this.destroy();
                            this.ieFailToOpenRej();
                        }
                        else if (ieStatus === 'INSECURE') {
                            mainService.logBoth(`偵測到IE權限驗證頁（${this.url}），將進行權限驗證流程`);
                            return mainService.execIEAuth(this.port).then(() => {
                                onIeOpenedSafely();
                            }).catch(err => {
                                // mainService.logBoth(err); //已經show過了
                                mainService.logBoth(`KVM開啟流程失敗，請重新觸發`);
                                this.destroy();
                                this.ieFailToOpenRej();
                            });
                        }
                    })
            )
        return mainState.autoitProcessIndependencyGuard.push('IE驗證流程', handleIeOpening);

        //怕排進佇列的task在還沒開好IE這段時間被偵測到，而被以為IE已關而結束task，所以這段期間不會被結束（手動關機制現無就無此事）
        setTimeout(
            () => {
                this.isIESafelyOpened = true;
                this.isKvmOpened = true;
                ocrLib.sockets[this.positionIndex]?.write('detectusb');
                this.ieOpenRes();
            }, this.ieOpenTimeSpend
        );
        setTimeout(
            () => {
                if (!this.isWithLoadCsvTask) this.isKvmShowLongEnoughAndRemovable = true;
                if (this.isWithUploadRecipeTask) {
                    this.screenControl(false);
                }

            }, this.ieOpenTimeSpend + this.showKvmDuration
        );
    }
    // 早於kvm秀完不會被改，晚於kvm秀完會覆寫(openIE中若偵測到有task就不會關掉)
    setWithTask() {
        this.isKvmShowLongEnoughAndRemovable = false;
        this.isWithLoadCsvTask = true;
    }
    setTaskDone() {
        this.isLoadingCsvDone = true;
        const msg = `機台(${this.deviceNum})作業完成`;
        mainService.logBoth(msg);
    }
    destroy() {
        if (!this.isDestroyed) {
            this.isLoadingCsv = false; //為了讓ocr觸發但load csv失敗後
            this.isKvmShowLongEnoughAndRemovable = true;
            this.isDestroyed = true;
            this.kvmWindowName = '';//這註解掉可以避免尚有destroyed task是kvm視窗重名而亂跳的問題
            // this.deviceNum = '';
            mainService.tryCloseIeWindow(this.url);
        };
    }
    screenControl(isLock: boolean): Promise<any> {
        return mainState.autoitProcessIndependencyGuard.push(
            '解鎖屏', () => {
                const msg = `對${this.kvmWindowName}進行${isLock ? "鎖屏" : '釋放'}`;
                mainService.logBoth(msg);
                return mainService.controlKvmP(this.kvmWindowName, isLock).then(() => {
                });
            });
    }
    uploadRecipe() {
        if (!this.recipeNameToUpload) {
            mainService.logBothErr(`上傳Recipe失敗：${this.deviceNum}設備接收到上傳Recipe指令，但無接收到Recipe名稱`)
            return;
        }
        let execResult = qnxLib.tellUploadRecipeInfoP(this.recipeNameToUpload, this.deviceNum);
        if (execResult.isTold) {
            this.isUploadingRecipe = true;
            cmsLib.loader(true, '等待QNX Server執行上傳流程中');
            cmsLib.lockKvmPage(true);
            execResult.prom.then(() => {
                cmsLib.loader(false);
                cmsLib.lockKvmPage(false);
                this.screenControl(false)
                this.isUploadRecipeTaskDone = true;
                this.isUploadingRecipe = false;
            }).catch(err => {
                // console.log(err);
                this.isUploadingRecipe = false;
                this.screenControl(false)
                cmsLib.loader(false);
                cmsLib.lockKvmPage(false);
            })
        }
    }
    loadCsvThenWaitResultP() {
        if (this.isCsvFileloaded) {
            return Promise.reject(
                new PromFailErr(`確保只執行過一次${KvmTask.loadCsvProcessName}流程`,
                    `異常：${this.deviceNum}機台已完成過${KvmTask.loadCsvProcessName}流程`, null)
            );
        }
        cmsLib.lockKvmPage(true);
        this.isLoadingCsv = true;
        mainService.logBoth(`${this.deviceNum}機台將進行${KvmTask.loadCsvProcessName}流程`);

        let autoitProm = mainState.autoitProcessIndependencyGuard.push('讀取CSV檔', () => keys.loadCsv(this.kvmWindowName).then(
            // succ
            () => {
                if (!mainData.testmode) {
                    this.isCsvFileloaded = true;
                }
                setTimeout(() =>{
                    mainService.logBoth("向QNX伺服器發送下載Csv的資料");
                },1000 * 1)
                mainService.logBoth(`${this.deviceNum}機台完成${KvmTask.loadCsvProcessName}流程，等待參數結果中（timeout:${this.waitParamCheckResultT / 60 / 1000}分鐘）`);
                // setTimeout(() => {
                //     handleReceivedCsv('hhihihih', `TYPE DATA,DK105-X-78-C6

                // [Recognition mode1]
                // 1,INTERPOSER POS REC,1.000,
                // 2,DIE POS REC(STAGE),1.000,
                // 3,OVERLAP POS REC,0.000,
                // 4,DIE POS REC(WAFER),1.000,
                // 5,DIE INK MARK REC,0.000,
                // 6,DIE CRACK REC,0.000,
                // 7,DUMMY DIE REC,0.000,
                // 8,PRE BOND INSPECTION REC,0.000,
                // `)
                // }, 5000)
            },
            //fail
            (err: any) =>
                Promise.reject(
                    new PromFailErr(`${KvmTask.loadCsvProcessName}按鍵精靈流程`,
                        `${KvmTask.loadCsvProcessName}按鍵精靈流程異常中止，通常因為KVM視窗已關閉所導致`, err)
                )
        ))
        return autoitProm.then(
            () => {
                return new Promise<void>((res, rej) => {
                    this.succToWaitParamResultRes = res;
                    setTimeout(() => {
                        if (!this.isLoadingCsvDone) {
                            rej(new PromFailErr(`${this.deviceNum}機台等待參數結果`,
                                `${this.deviceNum}機台等待參數結果失敗（timeout:${this.waitParamCheckResultT / 60 / 1000}分鐘）`,
                                null)
                            );
                        }
                    }, this.waitParamCheckResultT);
                }).then(() => {
                    this.isLoadingCsvDone = true;
                    mainService.logBoth(`收到${this.deviceNum}機台參數比對結果`);
                })
            })
    }
    receiveCheckParamResult(failMsg: string) {
        let result = new ParamCheckResult();
        let prom;
        if (failMsg === '') {
            result.isSucc = true;
            const succTip = `${this.deviceNum}機台參數檢驗結果：合格`;
            // mainService.logBoth(succTip);
            cmsLib.tellParamCheckRelated(succTip);
            cmsLib.tellParamCheckResult(true);
            prom = this.sendKeyOfResult(true).then(() => new Promise(res => setTimeout(res, 500)))
                .then(() => this.screenControl(false).then(() => ''));
        }
        else {
            result.isSucc = false;
            result.msg = failMsg;
            const failTip = `${this.deviceNum}機台參數檢驗結果：不合格（${failMsg}）`;
            // mainService.logBothErr(failTip);
            cmsLib.tellParamCheckRelated(failTip);
            cmsLib.tellParamCheckResult(false);
            prom = this.sendKeyOfResult(false).then(() => new Promise(res => setTimeout(res, 500)));
            // .then(() => this.screenControl(false).then(() => ''));
            mainState.autoitProcessIndependencyGuard.push('取消Auto', () => keys.cancelAuto(this.kvmWindowName).then())
        }
        new Promise((res) => setTimeout(res, 1000 * 8)).then(() => {
            this.isLoadingCsv = false;
            mainState.kvmTaskManeger.isLoadingCsv = false;
        }
    )
        prom.then(() => {
            this.succToWaitParamResultRes();
        })
    }
    sendKeyOfResult(isSucc: boolean) {
        return mainState.autoitProcessIndependencyGuard.push(
            '傳送結果按鍵組合', () => {
                const msg = `執行${isSucc ? "成功" : '失敗'}結果按鍵組合`;
                mainService.logBoth(msg);
                return (isSucc ? keys.succ(this.kvmWindowName) : keys.fail(this.kvmWindowName));
            });
    }
}

export class KvmTaskManeger {
    // isControllingKvm = false;//為真期間不可以align kvm，免得影響視窗active (後來發現這並不唯一，ocr可以同時測到同時鎖)
    constructor() {
        setInterval(() => {
            this.tryQueueInFromWaitingQue();
        }, 3000);

        setInterval(() => {
            this.handleLoadCsvQue();
            // console.log(this.queueToShowKvm)
        }, 5000);

        // //偵測task的url
        // setInterval(() => {
        //     mainService.getOpeningIEUrls().then(urls => {

        //         let handledUrls: string[] = [];
        //         urls.forEach(url => {
        //             let _urls = url.replace(/vkchttps/g, 'vkc,https').split(',');
        //             handledUrls = handledUrls.concat(_urls.map(u => u.replace(String.fromCharCode(13), '')))
        //         });

        //         this.queueToShowKvm.forEach(task => {
        //             //如果沒有對應的ie視窗開著的話
        //             if (!handledUrls.some(url => url === task.url)) {
        //                 if (task.isKvmOpened && !task.isDestroyed) {
        //                     if (task.isLoadingCsv) {
        //                         //如果關到正在load csv的過程，自然會報錯摧毀
        //                         //如果已經在等比對結果，就不作事，讓比對結果的部分來自然完成流程
        //                     }
        //                     else {
        //                         const msg = `機台(${task.deviceNum})IE視窗被手動關閉，將從任務佇列中清除`;
        //                         mainService.logBoth(msg);
        //                         task.destroy();
        //                     }

        //                 }

        //             }
        //         });
        //     });
        // }, 2500);

    }
    loadCsvQue: KvmTask[] = []; // 第0個就是正在作的
    queueToShowKvm: KvmTask[] = [];
    queueThatwaitingIntoShowKvmQue: KvmTask[] = [];
    currWaitingCheckParamResultDeviceNum = '';
    isLoadingCsv = false
    /**
     * Load Csv期間若接收到比對結果，要用此參數判定是哪台設備的
     * @param deviceNum 
     */
    setCurrDeviceNum(deviceNum: string = '') {
        this.currWaitingCheckParamResultDeviceNum = deviceNum;
    }
    /**
     * 
     * @param deviceNum 
     * @param url 
     * @param isAllowedIntoWatingQue tryQueueInFromWaitingQue 專用，為了不要重複排進候補佇列
     */
    add(deviceNum: string, url: string, isAllowedIntoWatingQue: boolean = true, recipeNameToUpload: string = '') {
        if (!url.includes('port=')) {
            const errMsg = `請輸入正確之kvm觸發網址（需含有port=字樣）`;
            mainService.logBothErr(errMsg);
            return null;
        }
        let kvmTask = new KvmTask(deviceNum, url);
        if (recipeNameToUpload) {
            kvmTask.isWithUploadRecipeTask = true;
            this.markWithLoadingCsvTask(kvmTask);
            kvmTask.recipeNameToUpload = recipeNameToUpload;
        }

        let isSuccToAdd = false;

        const task = this.get(deviceNum);
        //已有該設備的task
        if (task) {
            // 作完就換
            if (task.canBeReplaced) {
                this.replace(task, kvmTask);
                isSuccToAdd = true;
            }
            // 沒作完就直接返還正在作的
            else kvmTask = task;
        }
        //無該設備的task
        else {
            //少於4直接排
            if (this.queueToShowKvm.length < 4) {
                this.queueToShowKvm.push(kvmTask);
                isSuccToAdd = true;
            }
            //否則從老的開始找沒做完的，有就替換
            else {
                let toReplaceArr: KvmTask[] = [];
                for (let i = 0; i < this.queueToShowKvm.length; i++) {
                    let task = this.queueToShowKvm[i];
                    if (task.canBeReplaced) {
                        toReplaceArr.push(task)
                    }
                }
                if (toReplaceArr.length !== 0) {
                    let toBeReplacedTask: KvmTask = toReplaceArr.sort((a, b) => b.lifeSpanInMS - a.lifeSpanInMS)[0];
                    this.replace(toBeReplacedTask, kvmTask);
                    isSuccToAdd = true;
                }
            }
        }

        if (!isSuccToAdd) {
            if (isAllowedIntoWatingQue) this.queueThatwaitingIntoShowKvmQue.push(kvmTask);
        }
        else {
            kvmTask.positionIndex = this.queueToShowKvm.findIndex(kvm => kvmTask === kvm);
            kvmTask.openIEWithAuthCheck();
        }
        return isSuccToAdd ? kvmTask : null;
    }
    tryQueueInFromWaitingQue() {
        let queuedTasks: KvmTask[] = [];
        //排進當前佇列看看
        this.queueThatwaitingIntoShowKvmQue.forEach(task => {
            if (this.add(task.deviceNum, task.url, false)) {
                queuedTasks.push(task);
            };
        })
        //從待入隊佇列移除
        queuedTasks.forEach(task => {
            this.queueThatwaitingIntoShowKvmQue.splice(this.queueThatwaitingIntoShowKvmQue.indexOf(task), 1);
        });

        if (this.queueThatwaitingIntoShowKvmQue.length !== 0) {
            const msg = `尚有${this.queueThatwaitingIntoShowKvmQue.length}個KVM呼叫等待執行`;
            mainService.logBoth(msg);
        }
    }
    handleLoadCsvQue() {
        if (this.loadCsvQue.length === 0) return;

        let task = this.loadCsvQue[0];
        let self = this;
        if (task.isLoadingCsvDone || task.isLoadingCsvFailed) {
            removeFirstInLoadCsvQue();
            if(mainData.testmode){
                task.isLoadingCsvDone = false;
                task.isLoadingCsvFailed = false;
            }
        }
        else {
            if (task.isLoadingCsv || this.isLoadingCsv) { }
            else {
                //同時間只會有一台
                this.isLoadingCsv = true;
                task.isLoadingCsv = true;
                this.setCurrDeviceNum(task.deviceNum);
                qnxLib.DownloadCSV(task.deviceNum);
                task.loadCsvThenWaitResultP().then(
                    () => {
                        cmsLib.lockKvmPage(false);
                        this.setCurrDeviceNum();//reset
                    }
                ).catch(
                    (pfe: PromFailErr) => {
                        mainService.handleErr(pfe);
                        cmsLib.lockKvmPage(false);
                        this.setCurrDeviceNum();//reset
                        // mainService.logBothErr(err);
                        mainService.logBothErr(`機台${task.deviceNum}流程失敗，請重新觸發`);//這邊說明感覺不夠好
                        task.isLoadingCsv = false;
                        task.isLoadingCsvFailed = true;
                        removeFirstInLoadCsvQue();
                        task.destroy();//不可splice，不然位置會跑掉
                    })
            }
        }

        function removeFirstInLoadCsvQue() {
            mainService.logBoth(`機台${task.deviceNum}自${KvmTask.loadCsvProcessName}任務佇列移除`);
            self.loadCsvQue.splice(0, 1);
        }
    }

    markWithLoadingCsvTask(task: KvmTask) {
        task.setWithTask();
    }
    enterLoadCsvQue(task: KvmTask) {
        if (this.loadCsvQue.some(taskInQue => taskInQue === task)) {
            mainService.logBoth(`設備${task.deviceNum}已在${KvmTask.loadCsvProcessName}排程中`);
        }
        else {
            this.loadCsvQue.push(task);
            mainService.logBoth(`設備${task.deviceNum}排入${KvmTask.loadCsvProcessName}任務佇列，等待執行${KvmTask.loadCsvProcessName}流程`);
        }
    }
    // trySetCurrTaskDone() {
    //     let task = this.get(this.currDeviceNum);
    //     if (task) task.isTaskDone = true;
    // }
    replace(task: KvmTask, newTask: KvmTask) {
        this.queueToShowKvm.splice(this.queueToShowKvm.indexOf(task), 1, newTask);
        task.destroy();
    }
    get(deviceNum: string) {
        return this.queueToShowKvm.find(task => task.deviceNum === deviceNum && !task.isDestroyed);
    }
    registerUploadRecipeTask(recipeName: string, deviceNum: string) {
        let urlObj = mainData.webSets[mainState.webSetIndex].webUrlObjs.find(obj => obj.deviceNumber === deviceNum);
        if (!urlObj) {
            const errMsg = `無搜尋到對應${deviceNum}的url，請於切換網頁頁確認設備編號是否填寫正確`;
            mainService.logBothErr(errMsg);
            return
        }
        cmsLib.lockKvmPage(true);
        let task = this.get(deviceNum);
        // 已經有task，而且尚未完成過loadCsv流程
        if (task && ((!task.isLoadingCsvDone && !task.isLoadingCsvFailed) || mainData.testmode)) {

            // 可能已因ocr或者是之前的IT要求而標註過
            this.markWithLoadingCsvTask(task);//這樣就不會移除
            if (task.isWithUploadRecipeTask) {
                if (task.isUploadingRecipe) { }  // 表示已經被鎖屏且試圖進行upload recipe流程了
                else {
                    task.screenControl(true);
                    task.uploadRecipe();
                }
            }
            else {
                task.isWithUploadRecipeTask = true;
                task.recipeNameToUpload = recipeName;
                if (task.isKvmOpened) {
                    task.screenControl(true);
                    task.uploadRecipe();
                }
            }
        }
        else {
            let addedTask = this.add(deviceNum, urlObj.url, true, recipeName);
            if (!addedTask) { //已經在排隊了
                mainService.logBoth(`各機台皆未完成，${deviceNum}排隊等待解鎖`);
            }
        }
        cmsLib.lockKvmPage(false);
    }
    getCurrLoadingCsvTask() { return this.loadCsvQue[0]; }
}