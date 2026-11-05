import os
import uvicorn
import webbrowser
import threading
import time

def open_browser(port):
    time.sleep(1.2)
    webbrowser.open(f"http://127.0.0.1:{port}")

if __name__ == "__main__":
    port_env = os.environ.get("PORT")
    port = int(port_env) if port_env else 8000
    host = "0.0.0.0" if port_env else "127.0.0.1"

    print("=" * 60)
    print("  CHINH PHỤC VŨ TRỤ ĐIỂM 10 - THPT BỘC BỐ")
    print("  CLB AI & NĂNG LỰC SỐ")
    print(f"  Đang khởi động máy chủ tại http://{host}:{port}")
    print("=" * 60)

    if not port_env:
        threading.Thread(target=open_browser, args=(port,), daemon=True).start()

    uvicorn.run("backend.app:app", host=host, port=port, reload=False)
