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
        MouseClick("left",($x_top_left+$x_relative_to_tl*$m_to_a_ratio+$x_local*$m_to_a_ratio),($y_top_left+$y_relative_to_tl*$m_to_a_ratio+$y_local*$m_to_a_ratio))
        ;MsgBox(0, "Title", $x_top_left, 1)
    Else
        Exit (1)
    EndIf
EndFunc

leftClickWithCheck(117,475);點擊Main menu圖示

leftClickWithCheck(105,270);點擊Maintenance圖示

leftClickWithCheck(130,190);點擊Output data圖示

leftClickWithCheck(138,180);點擊Type data圖示

leftClickWithCheck(170,237);點擊System data圖示

leftClickWithCheck(173,304);點擊Machine data圖示

leftClickWithCheck(607,470);點擊Data output圖示

leftClickWithCheck(262,320);點擊Save圖示

leftClickWithCheck(60,60,2);點擊Home圖示

leftClickWithCheck(106,145);點擊Auto圖示
