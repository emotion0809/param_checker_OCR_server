$winTitle=$CmdLine[1]

WinActivate($winTitle)
Send("{LCTRL}")
Sleep ( 300)
WinActivate($winTitle)
Send("{LCTRL}")
Sleep ( 300)
WinActivate($winTitle)
Send("{s}")
