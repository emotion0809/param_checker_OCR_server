$mainWindowHandle=$CmdLine[1]
$x=$CmdLine[2]
$y=$CmdLine[3]
$w=$CmdLine[4]
$h=$CmdLine[5]

$hWndPtr=Ptr($mainWindowHandle)
WinActivate($hWndPtr)
WinMove($hWndPtr,"",$x,$y,$w,$h)