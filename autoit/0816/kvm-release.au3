$interval=300
$mainWindowTitle=$CmdLine[1]

WinActivate($mainWindowTitle)
Send("{LCTRL}")

Sleep($interval)
WinActivate($mainWindowTitle)
Send("{LCTRL}")

Sleep($interval)
WinActivate($mainWindowTitle)
Send("{F4}")