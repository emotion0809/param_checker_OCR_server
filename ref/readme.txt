主程式：開啟參數比對程序（若進行比對則會在AllData資料夾中建立該xlsx檔副本）
編輯器：開啟使用者介面並同時啟動參數比對程序
測試連線：將本目錄的xlsx檔傳給參數比對程序並返回比對結果
主程式(無tcpip)：偵測到Excel檔傳入則進行參數比對。

編輯器連主程式port:8083
監聽Excel檔路徑port:8084

合格條件：
1. Excel.xlsx檔必須具備該欄位  2.值沒超過上下限 
兩者皆滿足回傳OK，否則回傳Parameter Error

檢測Excel指令範例：
start,C:\Users\hellokitty\Desktop\DATA_DT.xlsx

管理參數密碼：autohhcparam