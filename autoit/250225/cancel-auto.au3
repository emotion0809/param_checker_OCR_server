; intervals
$interval = 3000
$longInterval = 15000
$shortInterval = 500

; relative to left top corner of kvm window
$x_relative_to_tl=550
$y_relative_to_tl=220

; title from outside
$windowTitle=$CmdLine[1]

; Murgee to autoit ratio
$m_to_a_ratio=0.65

If (WinExists($windowTitle)=0) Then
    Exit (1)
EndIf

$arr=WinGetPos($windowTitle)
$x_top_left=$arr[0]
$y_top_left=$arr[1]
$w=$arr[2]
$h=$arr[3]

;~ x_local => relative to ($x_top_left + $x_relative_to_tl)
Func leftClickWithCheck($x_local,$y_local,$intervalIndex=0)
    If (WinExists($windowTitle)=1) Then
        Local $intervalArr=[$shortInterval,$interval,$longInterval]
        Sleep($intervalArr[$intervalIndex])
        WinActivate($windowTitle)
        ; 函數參數似乎不可以隨便換行，會壞掉(Error: Error pasing function call)
        MouseClick("left",($x_top_left+$x_local),($y_top_left+$y_local))
        ;MsgBox(0, "Title", $x_top_left, 1)
    Else
        Exit (1)
    EndIf
EndFunc

leftClickWithCheck(280,160);點擊Auto圖示
