$interval = 3000
$longInterval = 5000
$shortInterval = 1000
$windowTitle="Phindows"

;HotKeySet("{ESC}", "Terminate")

;Func Terminate()
   ;MsgBox(0, "Procedure Terminated", "Esc btn pressed and procedure stopped.")
   ;Exit
;EndFunc


Sleep($longInterval)
WinActivate($windowTitle)
Sleep($interval)
WinActivate("Connect")
;$arr=WinGetPos("Photon Terminal")
;$x=$arr[0]
;$y=$arr[1]
;$w=$arr[2]
;$h=$arr[3]
;MouseClick("right",$x+$w/100,$y+$h/100)

Sleep($interval)
Send("{TAB}")
;Sleep($interval)
;Send("{BACKSPACE}")
Sleep($shortInterval)
Send("192.168.1.91")
Sleep($shortInterval)
Send("{ENTER}")
;�i�J�n�J�e��
Sleep($interval)
Send("root")
Sleep($shortInterval)
Send("{ENTER}")

;�i�JGUI��
Sleep($longInterval)
$arr=WinGetPos($windowTitle)
$x=$arr[0]
$y=$arr[1]
$w=$arr[2]
$h=$arr[3]
MouseClick("right",$x+$w/2,$y+$h/2)
Sleep($shortInterval)
Send("s")
Sleep($shortInterval)
Send("pfm &")
Sleep($shortInterval)
Send("{ENTER}")
;�i�JQnx��

Sleep($longInterval)
Send("hte")
Sleep($shortInterval)
Send("{ENTER}")
Sleep($shortInterval)
Send("cm700_dt")
Sleep($shortInterval)
Send("{ENTER}")
Sleep($shortInterval)
Send("save")
Sleep($shortInterval)
Send("{ENTER}")
Sleep($shortInterval)
Send("tdt")
Sleep($shortInterval)
Send("{F7}") ;�|show�ܦhrecipe�ɮ�,�ҥH���U�ӵy��

Sleep($shortInterval)
Send("{TAB}")
Sleep($shortInterval)
Send("{ENTER}")
Sleep($shortInterval)
Send("{TAB}")
Sleep($shortInterval)
Send("{TAB}")
Sleep($shortInterval)
Send("{TAB}")
Sleep($shortInterval)
Send("{TAB}")

For $i=1 to 9 step 1
Sleep($shortInterval)
Send("{ENTER}")
Sleep($shortInterval)
Send("{TAB}")
Next


Sleep($shortInterval)
Send("{ENTER}")
Sleep($shortInterval)
WinClose($windowTitle)


