Sleep(3000)

$arr=WinGetPos("Phindows")
$x=$arr[0]
$y=$arr[1]
$w=$arr[2]
$h=$arr[3]

MouseClick("right",$x+$w/2,$y+$h/2)