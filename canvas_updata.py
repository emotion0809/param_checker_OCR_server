import globals as gb
import UI
import time
import pyautogui
import sys
from PIL import ImageTk, Image

def screenshot():
    """截取螢幕並顯示在畫布上"""
    global tkinter_image
    gb.screenshot_image = pyautogui.screenshot()
    #將圖片轉換為Tkinter可用的格式
    tkinter_image = ImageTk.PhotoImage(gb.screenshot_image)
    UI.screenshot_canvas.delete("all")
    UI.screenshot_canvas.create_image(0,0, anchor="nw", image=tkinter_image)

def screenshot_loop():
    """截圖循環，適用於循環模式"""
    try:
        while UI.start_screenshot_loop.get() == "1":
            if not gb.ready_to_label_something: #進行標註作業時不進行截圖
                screenshot()
                #截圖後重新繪製方框
                if gb.auto_rectangle.rectangle:
                    repaint_rectangle(gb.auto_rectangle)
                if gb.Standard_Setting_rectangle.rectangle:
                    repaint_rectangle(gb.Standard_Setting_rectangle)
                if gb.B_manual_rectangle.rectangle:
                    repaint_rectangle(gb.B_manual_rectangle)
                time.sleep(1.5)
    except:
        pass

def start_rectangle(event,rectangle_data):
    """開始繪製方框"""
    global start_x, start_y, rectangle
    rectangle,color = rectangle_data.rectangle,rectangle_data.color
    start_x, start_y = UI.screenshot_canvas.canvasx(event.x), UI.screenshot_canvas.canvasy(event.y)
    if rectangle:
        UI.screenshot_canvas.delete(rectangle)
    rectangle = UI.screenshot_canvas.create_rectangle(start_x, start_y, start_x, start_y, outline=color, width=2)

def update_rectangle(event):
    """更新方框大小"""
    if rectangle:
        x, y = UI.screenshot_canvas.canvasx(event.x), UI.screenshot_canvas.canvasy(event.y)
        UI.screenshot_canvas.coords(rectangle, start_x, start_y, x, y)

def end_rectangle(rectangle_data):
    """完成方框繪製並記錄座標"""
    x0, y0, x1, y1 = UI.screenshot_canvas.coords(rectangle)
    #紀錄座標與方框到rectangle_data類別
    rectangle_data.set_coordinate(x0, y0, x1, y1)
    rectangle_data.rectangle = rectangle
    print(f"Rectangle coordinates: ({x0}, {y0}) to ({x1}, {y1})")

def repaint_rectangle(rectangle_data):
    """重新繪製方框"""
    left,top,right,bottom = rectangle_data.get_coordinate()
    color = rectangle_data.color
    rectangle = UI.screenshot_canvas.create_rectangle(left, top, right, bottom, outline=color, width=2)
    rectangle_data.rectangle = rectangle

def paint_save_rectangle():
    gb.auto_rectangle.set_coordinate(
        gb.save_data["Auto"]["left"],
        gb.save_data["Auto"]["top"],
        gb.save_data["Auto"]["right"],
        gb.save_data["Auto"]["bottom"])
    gb.B_manual_rectangle.set_coordinate(
        gb.save_data["B_manual"]["left"],
        gb.save_data["B_manual"]["top"],
        gb.save_data["B_manual"]["right"],
        gb.save_data["B_manual"]["bottom"])
    gb.Standard_Setting_rectangle.set_coordinate(
        gb.save_data["Standard_Setting"]["left"],
        gb.save_data["Standard_Setting"]["top"],
        gb.save_data["Standard_Setting"]["right"],
        gb.save_data["Standard_Setting"]["bottom"])
    repaint_rectangle(gb.auto_rectangle)
    repaint_rectangle(gb.B_manual_rectangle)
    repaint_rectangle(gb.Standard_Setting_rectangle)