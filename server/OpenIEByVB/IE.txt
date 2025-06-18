Dim IE, fso, file, url, scriptPath

' 創建檔案系統物件
Set fso = CreateObject("Scripting.FileSystemObject")

' 獲取腳本所在目錄
scriptPath = fso.GetParentFolderName(WScript.ScriptFullName)

' 開啟並讀取 txt 檔案
Set file = fso.OpenTextFile(scriptPath & "\url.txt", 1) ' 動態拼接路徑
url = file.ReadLine ' 讀取第一行作為網址
file.Close

' 創建 IE 物件
Set IE = CreateObject("InternetExplorer.Application")
IE.Visible = True

' 導航到從 txt 檔讀取的網址
IE.Navigate url

' 清理物件
Set file = Nothing
Set fso = Nothing
Set IE = Nothing