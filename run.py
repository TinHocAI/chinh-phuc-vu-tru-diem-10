import uvicorn
import webbrowser
import threading
import time

def open_browser():
    time.sleep(1.2)
    webbrowser.open("http://127.0.0.1:8000")

if __name__ == "__main__":
    print("=" * 60)
    print("  CHINH PHỤC VŨ TRỤ ĐIỂM 10 - THPT BỘC BỐ")
    print("  CLB AI & NĂNG LỰC SỐ")
    print("  Đang mở giao diện game tại http://127.0.0.1:8000")
    print("=" * 60)
    threading.Thread(target=open_browser, daemon=True).start()
    uvicorn.run("backend.app:app", host="127.0.0.1", port=8000, reload=True)
