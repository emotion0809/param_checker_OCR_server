import socket
import sys
import globals as gb
import time

def runing_TCP_server():
    """開啟TCPServer"""
    bind_ip = "127.0.0.1"
    bind_port = gb.save_data["TCP_port"]
    OCR_id = gb.save_data["OCR_ID"]

    server = socket.socket(socket.AF_INET,socket.SOCK_STREAM)
    server.bind((bind_ip,bind_port))

    server.listen(1024)

    print ("[*] Listening on %s:%d " % (bind_ip,bind_port))

    while not gb.stop_event.is_set():
        client,addr = server.accept()
        print ('Connected by ', addr)
        while not gb.stop_event.is_set():
            try:
                if gb.send_messsage_to_kvm:
                    message = f"auto{OCR_id}"
                    client.send((message).encode('utf-8'))
                    time.sleep(30)
            except:
                pass