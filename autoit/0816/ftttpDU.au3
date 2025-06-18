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
WinActivate("???一?")

Sleep($interval)
Send("192.168.1.91")
Sleep($interval)
Send("!S")
Sleep($interval)
;大寫B無效
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

;複製overrdie觸發子到遠端
Sleep($interval)
Send("{TAB}")
Sleep($interval)
Send("{DOWN}")
Sleep($interval)
Send("{TAB}")
Sleep($interval)
Send("{DOWN}")

; 決定不要用搜的了，因為搜到之後按右是指到別的檔，不知道按啥可以選到
; Sleep($interval)
; Send("^f") ;大寫無效
Sleep($interval)
Send("override-trigger")
;Sleep($interval)
;Send("{ENTER}")
;Sleep($interval)
;Send("{RIGHT}")
Sleep($interval)
Send("^u")



;backup
Sleep($lognInterval)
Send("{TAB}")
Sleep($interval)
Send("{DOWN}")
Sleep($interval)
Send("^a")
Sleep($interval)
Send("^d")
Sleep($interval)
Send("!a");確定下載

Sleep($lognInterval)
Send("{DELETE}")
Sleep($interval)
Send("!a");確定刪除(全)

Sleep($lognInterval)
Send("{TAB}")
Sleep($interval)
Send("{DOWN}")
Sleep($interval)
Send("^f") ;大寫無效
Sleep($interval)

;Send($CmdLine[0]) 參數個數
Send($CmdLine[1])

Sleep($interval)
Send("{ENTER}")
Sleep($interval)
Send("{RIGHT}")

Sleep($interval)
Send("^u")

Sleep($superLongInterval)
WinClose("192.168.1.91 (*) - FFFTP")