$pathObj=$MyInvocation.MyCommand.Path
$location=$pathObj.Path + '/load-csv.exe'
# & $location @(658474,100,100,500,500)
# 同時是給多參數的方式
write-host $pathObj

Read-Host -Prompt "Press Enter to continue"