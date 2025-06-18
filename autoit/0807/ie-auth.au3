$interval = 3000
;$bugSolvingInterval = 3000
$longInterval = 5000
$shortInterval = 1000

HotKeySet("{ESC}", "Terminate")

Func Terminate()
   MsgBox(0, "Procedure Terminated", "Esc btn pressed and procedure stopped.")
   Exit
EndFunc

$url="https://192.168.0.192/dpa.asp?username=admin&password=123456&port=24&client=vkc"

Sleep($longInterval)
WinActivate("[CLASS:IEFrame]")
Sleep($shortInterval)
ControlSend("[CLASS:IEFrame]", "", "[CLASSNN:ToolbarWindow322]", $url)

Sleep($longInterval)
Send("{ENTER}")

;超奇怪用$interval會壞,用3000、3500也壞,創新變數也壞,唯獨long不會壞
Sleep($longInterval)


For $i=1 to 8 step 1
Sleep($shortInterval)
Send("{TAB}")
Next

Sleep($shortInterval)
Send("{ENTER}")

For $i=1 to 2 step 1
Sleep($shortInterval)
Send("{TAB}")
Next

Sleep($shortInterval)
Send("{ENTER}")

Sleep($longInterval)

For $i=1 to 2 step 1
Sleep($shortInterval)
Send("{TAB}")
Next

Sleep($shortInterval)
Send("{ENTER}")

Sleep($shortInterval)
Send("{ENTER}")