import UI 
import pattern_recognition as pr
import TCP_socket as tsk
import globals as gb
import threading 
import time
import json
import os
from rectangle_data import *

def loop_OCR():
    """持續執行圖片辨識的背景執行緒"""
    while not gb.stop_event.is_set():
        if gb.auto_rectangle.rectangle:
            auto_red_ratio = pr.calculate_color_pixel_ratio(gb.auto_rectangle,"red")
            print(f"auto紅色佔比:{auto_red_ratio}")
        if gb.B_manual_rectangle.rectangle:
            B_manul_white_ratio = pr.calculate_color_pixel_ratio(gb.B_manual_rectangle,"white")
            print(f"B_manual白色佔比:{B_manul_white_ratio}")
        if gb.Standard_Setting_rectangle.rectangle:
            Standard_Setting = pr.OCR(gb.Standard_Setting_rectangle)
            print(Standard_Setting)
        #條件符合後向KVM程式，傳送執行命令
        try:
            gb.send_messsage_to_kvm = auto_red_ratio > 0.85 and B_manul_white_ratio > 0.05 and "Standard Setting" in Standard_Setting
            print(gb.send_messsage_to_kvm)
        except:
            pass
        time.sleep(1)

if __name__ == '__main__':
    #取得json檔的絕對位置
    current_directory = os.path.dirname(os.path.abspath(__file__))
    print(current_directory)
    gb.json_path = os.path.join(current_directory,"save\\save.json")
    print(gb.json_path)
    #讀取json檔的資料
    if not os.path.isfile(gb.json_path):
        open(gb.json_path, "x") #如果json檔不在創建json檔
    json_file = open(gb.json_path,"r")
    read_data = json_file.read()
    gb.save_data = json.JSONDecoder().decode(read_data)
    json_file.close()
    # 啟動 OCR 背景執行緒
    thread_OCR = threading.Thread(target=loop_OCR, daemon=True)
    thread_OCR.start()
    # 啟動 TCP 背景執行緒
    thread_TCP_server = threading.Thread(target= tsk.runing_TCP_server, daemon=True)
    thread_TCP_server.start()
    # 啟動 GUI 主程式
    UI.run_window()
    



