#cs ----------------------------------------------------------------------------

 AutoIt Version: 3.3.14.5
 Author:         myName

 Script Function:
	Template AutoIt script.

#ce ----------------------------------------------------------------------------
$select_which_number_ip = 6

Run("C:\Users\user\Desktop\瑞薩機器軟體\FFFTP\FFFTP.exe");
Sleep(500)
WinActivate("FFFTP")
Sleep(500)
WinActivate("ホス")
Sleep(500)
send("192.168.1.91")
Sleep(500)
send("{Enter}")
Sleep(500);
MouseClick("left",520,85);#到指定資料夾
Sleep(500);
Send("../../hte/cm700_dt/dataout{Enter}");
Sleep(500);
MouseClick("left",40,85);#到指定資料夾
Sleep(500);
Send("D:\QNX{Enter}");
Sleep(500);
MouseClick("left",1000,500);#左鍵cm700資料夾
Sleep(500);
Send("^a");#全選
Sleep(500);
Send("^d");#傳送資料
Sleep(500);
Send("{Enter}");#傳送資料
Sleep(20000);
Send("!{F4}");
