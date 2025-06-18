$winTitle=$CmdLine[1]

$isExist=WinExists($winTitle)

IF $isExist=1 THEN
    ConsoleWrite('1')
ELSE
    ConsoleWrite('0')
EndIf