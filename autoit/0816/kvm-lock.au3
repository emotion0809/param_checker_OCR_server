$interval=100
$mainWindowTitle=$CmdLine[1]

DoMainTask()

DoMainTask()

Func DoMainTask()
    WinActivate($mainWindowTitle)

    Sleep($interval)
    WinActivate($mainWindowTitle)

    Sleep($interval)
    Send("{LCTRL}")

    Sleep($interval)
    Send("{LCTRL}")

    Sleep($interval)
    Send("{F5}")

    WinActivate($mainWindowTitle)

    Sleep($interval)
    Send("{LCTRL}")

    Sleep($interval)
    Send("{LCTRL}")

    Sleep($interval)
    Send("{F3}")
EndFunc

