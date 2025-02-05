import globals as gb
import canvas_updata as cu
import threading
import json
import sys
import time
import tkinter as tk
from tkinter import ttk

def ready_to_label_or_cancel_label(ready_to_label_target,press_button):
    """準備或取消標記作業作業"""
    if ready_to_label_target:
        ready_to_label_target = False
        press_button['bg'] = "#F3F3FA"
        #已取消標記作業，可循環截圖
        gb.ready_to_label_something = False
    else:
        #取消其他的標註作業
        gb.ready_to_label_Standard_Setting = False
        gb.ready_to_label_auto = False
        gb.ready_to_label_B_manual = False
        button_label_Standard_Setting['bg'] = "#F3F3FA"
        button_label_auto['bg'] = "#F3F3FA"
        button_label_auto['bg'] = "#F3F3FA"
        #進行標記作業中中，取消循環截圖
        gb.ready_to_label_something = True
        #執行目標標記作業
        ready_to_label_target = True
        press_button['bg'] = "#0080FF"
    return ready_to_label_target

def cancel_label(cancel_button):
    """取消標記的作業"""
    cancel_button['bg'] = "#F3F3FA"
    gb.ready_to_label_something = False
    return False

def save_coordinate_to_json(rectangle_name,rectangle_data):
    """紀錄座標到json檔"""
    global json_file
    try:
        gb.save_data[rectangle_name] = rectangle_data.get_coordinate_dict()
        write_data = json.dumps(gb.save_data) #將資料重dict轉換為json格式
        json_file = open(gb.json_path,"w")
        json_file.write(write_data)
        json_file.close()
    except:
        print("儲存json資料失敗")

#region UI互動
def press_button_screenshot():
    """觸發截圖動作，並重新繪製方框"""
    cu.screenshot()
    #在新圖畫上原本的方框
    if gb.auto_rectangle.rectangle:
        cu.repaint_rectangle(gb.auto_rectangle)

def press_button_label_Standard_Setting():
    """標記Standard_Setting方框"""
    gb.ready_to_label_Standard_Setting = ready_to_label_or_cancel_label(gb.ready_to_label_Standard_Setting,button_label_Standard_Setting)

def press_button_label_auto():
    """標記AUt0方框"""
    gb.ready_to_label_auto = ready_to_label_or_cancel_label(gb.ready_to_label_auto,button_label_auto)

def press_button_label_B_manual():
    """標記B_manual方框"""
    gb.ready_to_label_B_manual = ready_to_label_or_cancel_label(gb.ready_to_label_B_manual,button_label_B_manual)

def click_screenshot_loop():
    """啟動截圖循環的執行緒"""
    thread_screenshot = threading.Thread(target=cu.screenshot_loop)
    thread_screenshot.start()

def on_mouse_press(event):
    """滑鼠按下事件處理"""
    if gb.ready_to_label_auto:
        cu.start_rectangle(event,gb.auto_rectangle)
    if gb.ready_to_label_Standard_Setting:
        cu.start_rectangle(event,gb.Standard_Setting_rectangle)
    if gb.ready_to_label_B_manual:
        cu.start_rectangle(event,gb.B_manual_rectangle)

def on_mouse_drag(event):
    """滑鼠拖曳事件處理"""
    if gb.ready_to_label_something:
        cu.update_rectangle(event)
def on_mouse_release(event):
    """滑鼠釋放事件處理"""
    if gb.ready_to_label_auto:
        cu.end_rectangle(gb.auto_rectangle)
        gb.ready_to_label_auto = cancel_label(button_label_auto) #取消下次標註動作，避免誤標
        save_coordinate_to_json("Auto",gb.auto_rectangle)
         #取得方框的座標資料(dict格式)
    if gb.ready_to_label_Standard_Setting:
        cu.end_rectangle(gb.Standard_Setting_rectangle)
        #取消下次標註動作，避免誤標
        gb.ready_to_label_Standard_Setting = cancel_label(button_label_Standard_Setting) #取消下次標註動作，避免誤
        save_coordinate_to_json("Standard_Setting",gb.Standard_Setting_rectangle) 
    if gb.ready_to_label_B_manual:
        cu.end_rectangle(gb.B_manual_rectangle)
        gb.ready_to_label_B_manual = cancel_label(button_label_B_manual) #取消下次標註動作，避免誤
        save_coordinate_to_json("B_manual",gb.B_manual_rectangle) 

def open_application():
    # 啟動循環截圖背景執行緒
    thread_screenshot = threading.Thread(target=cu.screenshot_loop, daemon=True)
    thread_screenshot.start()
    cu.paint_save_rectangle()

def close_application():
    """關閉應用程式"""
    gb.stop_event.set()
    try:
        json_file.close()
    except:
        pass
    window.destroy()
    time.sleep(5)
    sys.exit()
#endregion

def run_window():
    """初始化並運行 GUI 主程式"""
    global window,start_screenshot_loop,screenshot_canvas
    global button_label_Standard_Setting,button_label_auto,button_label_B_manual
    OCR_ID=gb.save_data["OCR_ID"]
    #視窗大小與標題
    window = tk.Tk()
    window.geometry("720x450+0+0")
    window.title(f"OCR{OCR_ID}")
    
    ttk.Style().configure("A",font=("Arial",8,"bold"))
    
    #主要框架
    main_frame = tk.Frame(window)
    main_frame.pack(fill="both",expand=1)

    #第二框架
    second_frame = tk.Frame(main_frame,bg="#FFFFFF")
    second_frame.pack(fill="both",side="top",expand=1)

    #第三框架
    third_frame = tk.Frame(second_frame,bg="#FFFFFF")

    #第四框架
    fourth_frame = tk.LabelFrame(second_frame, text='標註',bg="#FFFFFF")

    #放置第二框架的物件
    third_frame.pack(side="left",fill="both",expand=1)
    fourth_frame.pack(side="right",fill="both",pady=5,padx=5)

    #新增截圖案紐
    button_screenshot = tk.Button(
        third_frame,text="截圖",
        font=("Arial",10,"bold"),
        width=8,
        bg = "#F3F3FA",
        activebackground = "#5A5AAD",
        command=press_button_screenshot)

    #新增截圖循環選項
    start_screenshot_loop = tk.StringVar()
    start_screenshot_loop.set(1)
    check_screenshot_loop = tk.Checkbutton(third_frame,
        text="loop",
        font=("Arial",8,"bold"),
        variable=start_screenshot_loop,
        command=click_screenshot_loop)
    
    #放置第三三框架的物件
    button_screenshot.grid(row=0,column=0,padx=20,pady=5,ipady=3)
    check_screenshot_loop.grid(row=1,column=0,padx=20,pady=3)

    #新增標註按鈕
    button_label_Standard_Setting = tk.Button(
        fourth_frame,text="Standard Setting",
        font=("Arial",8,"bold"),
        width=15,
        bg = "#F3F3FA",
        command=press_button_label_Standard_Setting
        )
    
    button_label_auto = tk.Button(
        fourth_frame,text="Auto",
        font=("Arial",8,"bold"),
        width=10,
        bg = "#F3F3FA",
        command=press_button_label_auto
        )
    
    button_label_B_manual = tk.Button(
        fourth_frame,text="B_manual",
        font=("Arial",8,"bold"),
        width=10,
        bg = "#F3F3FA",
        command=press_button_label_B_manual
        )

    
    button_label_Standard_Setting.grid(row=0,column=0,padx=5,pady=15,ipady=3)
    button_label_auto.grid(row=0,column=1,padx=5,pady=15,ipady=3)
    button_label_B_manual.grid(row=0,column=2,padx=5,pady=15,ipady=3)
    
    #第三框架
    third_frame = tk.Frame(main_frame)
    third_frame.pack(fill="both",side="top",expand=1)

    #創建畫布
    screenshot_canvas = tk.Canvas(third_frame)

    # 綁定事件
    screenshot_canvas.bind("<ButtonPress-1>", on_mouse_press)
    screenshot_canvas.bind("<B1-Motion>", on_mouse_drag)
    screenshot_canvas.bind("<ButtonRelease-1>", on_mouse_release)

    #新增滾動條
    xscollbar = tk.Scrollbar(third_frame, orient="horizontal",command=screenshot_canvas.xview)
    yscollbar = tk.Scrollbar(third_frame, orient="vertical",command=screenshot_canvas.yview)

    #綁定畫布
    screenshot_canvas.configure(xscrollcommand=xscollbar.set, yscrollcommand=yscollbar.set)

    #設定滾動條的範圍
    screenshot_canvas.bind("<Configure>",lambda e: screenshot_canvas.configure(scrollregion= screenshot_canvas.bbox("all")))

    #放置第三框架的物件
    xscollbar.pack(side="bottom",fill="x",ipadx=20)
    yscollbar.pack(side="right",fill="y",ipady=20)
    screenshot_canvas.pack(fill="both",expand=1)

    #啟動並隱藏視窗
    window.protocol("WM_DELETE_WINDOW", close_application)
    window.state("iconic")
    window.after(100,open_application)
    window.mainloop()


