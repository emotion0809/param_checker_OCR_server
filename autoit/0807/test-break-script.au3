HotKeySet("{ESC}", "Terminate")

Func Terminate()
   MsgBox(0, "Procedure Terminated", "Esc btn pressed and procedure stopped.")
   Exit
EndFunc   ;==>Terminate

Sleep(5000)
MsgBox(0, "", "This is a message.")