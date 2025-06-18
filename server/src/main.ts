import { hostTestExeclFileServer } from "./cs/test-excel.server";
import { hostParamCheckServer } from "./cs/main-no-tcpip-check-param.server";
import { procStartMsg } from "./is-production";
import { cmsLib } from "./cs/cms.server";
import { ocrLib } from "./cs/ocr.client";
import { qnxLib } from "./cs/qnx.server";
import { mainService } from "./main-service";
import { fileSys } from "./file-sys.lib";

console.log(procStartMsg);//cms連上線的時候會正式傳一次到log

cmsLib.hostCmsServerP().then(() => {
    hostTestExeclFileServer();
    hostParamCheckServer();
    setTimeout(() => { ocrLib.firstConnectToOcrP().then(()=>{
        cmsLib.tellOcrConnected();
    }); }, 3000)
    qnxLib.serve();
    mainService.detectRecipeFromIT()
})