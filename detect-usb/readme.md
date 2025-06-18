## 說明

1. node_modules是各種手動除去新語法(老node看不懂) + 已經針對node v4.9.1 npm rebuild 過的，可以直接用在產線。
2. 其中因為Node SerialPort的部分(@serialport)手調得很煩，直接回溯到v6了（為了支援node v4.9.1），但是怎麼改package-lock.json都看不出來回溯。
3. 所以用package-lock.json去npm install還是會有問題。
4. 其實不只@serialport回溯不會處理到，npm install後像有個dependency simple-get也會報語法錯誤，所以說npm install還是要手調一些東西。
5. node_modules因為裡面有檔名太長會導致git add失敗，所以就弄成壓縮檔。
   
6. 編譯ts檔時要用node v10以上版本，而測試時要用nvm 4.9.1 32，以32位元的node去測試，否則會報
   Error: \\?\C:\Users\hongk\Desktop\Projects\HKK\hhc-auto-param-checker\detect-usb\node_modules\serialport\build\Release\serialport.node is not a valid Win32 application.

## 參考
1. [Node SerialPort](https://serialport.io/docs/guide-platform-support)
2. [照著回溯版本並存版本於pack-lock.json但測不出有存](https://stackoverflow.com/questions/15890958/how-to-install-a-previous-exact-version-of-a-npm-package)
3. [手動修語法用babel](https://babeljs.io/repl#?browsers=defaults%2C%20not%20ie%2011%2C%20not%20ie_mob%2011&build=&builtIns=false&spec=false&loose=false&code_lz=G4QwTgBA7uB2CWsDmBlAprALhAvBAZiADYDOaAUOQMYD2sJ2UYIADgOryYAWAEvACb8MAYRoBbAHIgxaXBBAkAnrCoQWNMJhIAFMOPhlcAPggBvchAi162dZpJyQMTmo1bd-shYhg0mAK5gsK72AHRirAAUdtg4JuaWltYMELBoUNpucqYQoXkxEAC-3pa-AUEQAPIARgBWaFSYoUL4iGgeLGia8GgkkWkZbgA0ZiWJtJLSaABco4nzEEh-kQCUcwvz8PgQkQCEMEGIqBiYawkbCwcIyOhYcphg_hQXC8k0RGihV5FjL5YABgAiTKaACSsHwNFCEykMkBEC4Cgg1TQGAgQhYvioIEwaH4oQgAE0aP4ICQuCSiPxUjQoBB_IZgW5wZDQiwcVxAQSACpcWSYmidTSKaDwIhEZGyXxiGjAPEQRAQbiyNIAD2wEVqGh8aA-Ck-_1-FxWRvmxT-OvKwQGIKa7O4pqKQ0dGH8MmY1Q-s0IpDQzo2hX9iUKJssIfIxSAA&debug=false&forceAllTransforms=false&shippedProposals=false&circleciRepo=&evaluate=false&fileSize=false&timeTravel=false&sourceType=module&lineWrap=true&presets=env%2Creact&prettier=false&targets=Node-4.13&version=7.13.14&externalPlugins=)
