
export class PromFailErr {
    constructor(
        public failedTaskName: string,
        public instructionForOuterCatch: string = '', //給人看的
        public catchedErr: any = null,
    ) { }
    static handlePFE(pfe: PromFailErr,
        onIndeedPfe: (pfe: PromFailErr) => void,
        onUnexpectedErr: (err: Error) => void) {
        if (pfe instanceof PromFailErr) {
            onIndeedPfe(pfe);
        }
        else onUnexpectedErr(pfe);
    }
}