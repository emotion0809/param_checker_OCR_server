"""區域變數儲存"""
from rectangle_data import rectangle_data
from threading import Event

stop_event = Event()

auto_rectangle = rectangle_data("green")
B_manual_rectangle = rectangle_data("purple")
Standard_Setting_rectangle = rectangle_data("red")

screenshot_image = None

ready_to_label_Standard_Setting = False
ready_to_label_auto = False
ready_to_label_B_manual = False
ready_to_label_something = False

send_messsage_to_kvm = False

json_path = ".\\save\\save.json"
save_data = None



