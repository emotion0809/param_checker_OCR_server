$mainWindowTitle=$CmdLine[1]
$x=$CmdLine[2]
$y=$CmdLine[3]
$w=$CmdLine[4]
$h=$CmdLine[5]
If (WinExists($mainWindowTitle)) Then
    WinMove($mainWindowTitle,"",$x,$y,$w,$h)
    WinActivate($mainWindowTitle)
EndIf
