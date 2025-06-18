#include <IE.au3>
$superLongInterval=5000
$longInterval=4000
$interval=500
$shortInteval=300
$errorWindowName='Error: Error'

$port=$CmdLine[1]
$isCrackIEAuthPort=($CmdLine[2]="1") ? True : False

$url='https://192.168.0.192/dpa.asp?username=admin&password=123456&port=' & $port &'&client=vkc'
$kvmWindowNameFrontHalf='Dominion_KX3_Port'& $port

If ($isCrackIEAuthPort) Then
   $ie=_IECreate($url)
   Sleep($longInterval)
EndIf


;選到【其他】
For $i = 1 To 7 Step +1
    Sleep($shortInteval)
    Send("{TAB}")
Next

Sleep($interval)
Send("{ENTER}")

;繼續瀏覽網頁
For $i = 1 To 2 Step +1
   $shortInteval=300
   Send("{TAB}")
Next

Sleep($shortInteval)
Send("{ENTER}")

;等待java驗證
Sleep($superLongInterval)
WinActivate('Security Warning')

;移至確定
For $i = 1 To 2 Step +1
    $shortInteval=300
    Send("{TAB}")
Next

Sleep($shortInteval)
Send("{ENTER}")

Sleep($longInterval)

IF WinExists($errorWindowName) Then ;驗證失敗的確定
   WinActivate($errorWindowName)
   Send("{ENTER}")
   EXIT(1)
ELSE
   IF $isCrackIEAuthPort Then
      $hwnd=_IEPropertyGet($ie,"hwnd")
      WinSetState($hwnd,"", @SW_MINIMIZE)
   EndIf
   Sleep($longInterval)
   $isExist=WinExists($kvmWindowNameFrontHalf)

   IF $isExist=1 THEN
      EXIT(0)
   ELSE
      EXIT(1)
   EndIf
EndIf



