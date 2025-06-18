$interval = 3000

Sleep($interval)
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