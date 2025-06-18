function Open-IE-WithAuthCheck {
    param (
        [string]$Url
    )

    $ie = New-Object -com InternetExplorer.Application
    $ie.visible = $true
    
    Set-WindowPosition($ie.HWND)
    
    # $ie # show完整資訊
    $ie.navigate($Url) #這之後馬上寫$ie會壞掉，在這之前是不會（但是$ie.property則不會壞）

    # 會壞的
    #"a1"
    #$ie
    #"a2"

    # 不會壞
    # $ie.HWND
    # $ie.ReadyState

    #start-sleep -m 10   #不夠就會壞
    #start-sleep -m 1000 #夠時間開就不會壞

    # $ie #若給夠時間開好了，這卻已非完整資訊,只是物件名,看來只好用別的方法抓取（不直接沿用$ie）
    # $ie.HWND -eq　$null #True,似乎其他所有屬性都是null


    #一開始是0,成null應該可以視為已經開好
    #"start looping"
    while ($ie.ReadyState -ne $null) {
        start-sleep -m 10
    };
    #"end looping"

    start-sleep -m 1000 #不等一下好像會抓不到

    $openedIE = (New-Object -ComObject "Shell.Application").Windows() | Where-Object { $_.Name -eq "Internet Explorer" -and $_.LocationURL -eq $Url }

    # Document操作可參考 https://www.kiloroot.com/powershell-script-to-open-a-web-page-and-bypass-ssl-certificate-errors-2/

    $insecureTitle = "This site isn’t secure"
    $accessibleTitle = "Direct Port Access via URL"

    $title = $openedIE.Document.title
    $titleCount = $title.Count

    if ($titleCount -eq 0) { "ZERO_TITLE" }
    elseif ($titleCount -gt 1) { "MULTI_TITLE" }
    else {
        if ($title -eq $insecureTitle) { "INSECURE" }
        elseif ($title -eq $accessibleTitle) { "OK" }
        else { "UNKNOWN_TITLE" }

    }
}

function Set-WindowPosition {
    param (
        [IntPtr]$Handle
    )

    $d = (Get-WmiObject -Class Win32_VideoController).VideoModeDescription;
    $d = $d -replace ' '
    $arr = $d.Split("x")
    $screenW = [int]$arr[0]
    $screenH = [int]$arr[1]

    $windowW = 600
    $windowH = 300

    $posiX = $screenW - $windowW
    $posiY = $screenH - $windowH

    $setPOS = @'
[DllImport("user32.dll")]
public static extern bool SetWindowPos(IntPtr hWnd, 
IntPtr hWndInsertAfter, 
int X, 
int Y, 
int cx, 
int cy, 
uint uFlags);
'@

    $SetWindowPos = Add-Type -MemberDefinition $setPOS -name WinApiCall -passthru
    $SetWindowPos::SetWindowPos($Handle, 1, ${windowPosition.x}, ${windowPosition.y}, $windowW, $windowH, 0) | Out-Null
}

Open-IE-WithAuthCheck -Url 'https://192.168.0.192/dpa.asp?username=admin&password=123456&port=2&client=vkc'