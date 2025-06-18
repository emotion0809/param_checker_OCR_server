$winTitle=$CmdLine[1]

$isExist=WinExists($winTitle)

IF $isExist=1 THEN
   WinActivate($winTitle)
   Send("{ENTER}")
EndIf