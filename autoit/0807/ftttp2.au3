$interval = 3000

Sleep($interval)
Send("{TAB}")
Sleep($interval)
Send("{DOWN}")
Sleep($interval)
Send("^f") ;�j�g�L��
Sleep($interval)

;Send($CmdLine[0]) �ѼƭӼ�
Send($CmdLine[1])

Sleep($interval)
Send("{ENTER}")
Sleep($interval)
Send("{RIGHT}")