export let isProduction = true;
//
//
//
export let version = '2.7.2';
export const procStartMsg = `主程序(版本${version})開始...`;
//
//
//
if (!isProduction) for (let i = 0; i < 5; i++)console.log('-------【Dev Version】-------');

export let versionRemark = '版本小記：' + '1.以search方式找recipe（空白鍵選取）2.txt檔收後刪';