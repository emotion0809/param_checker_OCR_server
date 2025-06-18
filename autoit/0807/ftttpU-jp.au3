$interval = 1000
$lognInterval=5000
$superLongInterval=11000
$windowTitle="FFFTP (*)"

HotKeySet("{ESC}", "Terminate")

Func Terminate()
   MsgBox(0, "Procedure Terminated", "Esc btn pressed and procedure stopped.")
   Exit
EndFunc

Sleep($lognInterval)
WinActivate($windowTitle)
Sleep($interval)
WinActivate("ホスト一覧")

Sleep($interval)
Send("192.168.1.91")
Sleep($interval)
Send("!S")
Sleep($interval)
;�j�gB�L��
Send("^b")
Sleep($interval)
Send("L")
Sleep($interval)
Send("!J")
Sleep($interval)
Send("^b")
Sleep($interval)
Send("H")
Sleep($interval)
Send("!J")

;�R��
Sleep($interval)
Send("{TAB}")
Sleep($interval)
Send("{DOWN}")
Sleep($interval)
Send("{DELETE}")
Sleep($interval)
Send("!a")

Sleep($lognInterval)
Send("{TAB}")
Sleep($interval)
Send("{DOWN}")
Sleep($interval)
Send("^f") ;�j�g�L��
Sleep($interval)

;Send($CmdLine[0]) �ѼƭӼ�
Send($CmdLine[1])

Sleep($interval)
Send("{ENTER}")
Sleep($interval)
Send("{RIGHT}")

Sleep($interval)
Send("^u")

Sleep($superLongInterval)
WinClose("192.168.1.91 (*) - FFFTP")