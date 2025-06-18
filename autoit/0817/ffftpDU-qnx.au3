$interval = 1000
$lognInterval=5000
$superLongInterval=11000
$windowTitle="FFFTP (*)"

;HotKeySet("{ESC}", "Terminate")

; 函數定義不擋掉，用WinExists就會壞掉...
;~ Func Terminate()
;~    MsgBox(0, "Procedure Terminated", "Esc btn pressed and procedure stopped.")
;~    Exit
;~ EndFunc

$path=$CmdLine[1]
$recipeName=$CmdLine[2]
$deviceNumber=$CmdLine[3]
Run($path)

Sleep($lognInterval)
WinActivate($windowTitle)
Sleep($interval)
WinActivate("ホスト一覧")

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

;selection左移
Sleep($interval)
Send("{TAB}")
Sleep($interval)
Send("{DOWN}")
Sleep($interval)
Send("{TAB}")
Sleep($interval)
Send("{DOWN}")

;複製overrdie觸發子到遠端
Sleep($interval)
Send("override-trigger")
;Sleep($interval)
;Send("{ENTER}")
;Sleep($interval)
;Send("{RIGHT}")
Sleep($interval)
Send("^u")
;~ Sleep($interval)
;~ Send("^a")


;move to device-number specified folder
Sleep($lognInterval)
Send($deviceNumber)
Sleep($interval)
Send("{ENTER}")
Sleep($interval)
Send("{DOWN}")
; 決定不要用搜的了，因為搜到之後按右是指到別的檔，不知道按啥可以選到
;Sleep($interval)
;Send("^f") ;大寫無效



;backup
Sleep($interval)
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
WaitWinClose("ダウンロード")
WaitWinClose("ダウンロード")
WaitWinClose("ダウンロード")
WaitWinClose("ダウンロード")
WaitWinClose("ダウンロード")

Send("{DELETE}")
Sleep($interval)
Send("!a");確定刪除(全)

Sleep($lognInterval)
Send("{TAB}")
Sleep($interval)
Send("^f") ;大寫無效
Sleep($interval)

;Send($CmdLine[0]) 參數個數
Send($recipeName)

Sleep($interval)
Send("{ENTER}")
Sleep($interval)
Send("{SPACE}")

Sleep($interval)
Send("^u")

Sleep($lognInterval)
WaitWinClose("アップロード")
WaitWinClose("アップロード")
WaitWinClose("アップロード")
WaitWinClose("アップロード")
WaitWinClose("アップロード")

Sleep($interval)
WinClose("192.168.1.91 (*) - FFFTP")

Func WaitWinClose($title)
   Opt("WinTitleMatchMode", 2)
      While WinExists($title)=1
         Sleep($interval)
      WEnd
   Opt("WinTitleMatchMode", 1)
   Sleep(200)
EndFunc