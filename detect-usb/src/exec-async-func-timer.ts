export class ExecAsyncFuncTimer {
    private p: Promise<unknown> = Promise.resolve();
    /**
     * 定間隔執行async funciton（執行完才會重新計算間隔）。
     * 跟setInterval的差別是，此功能會等非同步的函數完成後，才繼續計時。
     * @param interval async函數結束後到再次開始執行async函數的間隔毫秒。
     * @param asyncCallback 
     * @param isKeepExecAfterErr 真時就算發生錯誤也會繼續執行。預設為否。可動態更動。
     */
    constructor(public interval: number, private asyncCallback: () => Promise<unknown>, public isKeepExecAfterErr = false) { }
    /** 開始定期執行async func。第一次會直接執行，不會等待。 */
    start() {
        // stop過的話為rejected狀態，所以要重新更新為resolved。
        this.p = Promise.resolve();
        this.exec();
    }
    /** 循環執行 */
    private async exec() {
        try {
            // this.p只有掛asyncCallback，不會掛後面的間隔等待。這樣的好處是insertAsyncTask掛上的時候不用等到間隔等待結束才執行。
            this.p = this.p.then(this.asyncCallback);
            await this.p;
            await new Promise(res => setTimeout(res, this.interval));
            this.exec();
        }
        catch (error) {
            console.log(error);
            if (this.isKeepExecAfterErr) {
                this.p = Promise.resolve(); // 要記得重置，否則發生錯誤時基本上this.p是rejected，會在這邊形成無限迴圈
                this.exec();
            }
        }
    }
    stop(stopMsg = 'stop ExecAsyncFuncTimer') { this.p = Promise.reject(stopMsg) }
    /** 以排隊的方式插入到asyncCallback的循環執行中。 */
    insertAsyncTask<T = unknown>(asyncCallback: () => Promise<T>): Promise<T> {
        const _p = this.p.then(asyncCallback);
        this.p = _p
        return _p;
    }
}