$path= Read-Host -Prompt "請輸入檔名"
"Wait 5 seconds"
""
""
Start-Sleep 5
Start-Process $path
Read-Host "Enter to leave..."