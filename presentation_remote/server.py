import asyncio
import json
import socket
import threading
import sys
import os
import ctypes
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import websockets

# --- Windows Native Input API via ctypes (Zero Latency) ---
u32 = ctypes.windll.user32

MOUSEEVENTF_MOVE = 0x0001
MOUSEEVENTF_LEFTDOWN = 0x0002
MOUSEEVENTF_LEFTUP = 0x0004
MOUSEEVENTF_RIGHTDOWN = 0x0008
MOUSEEVENTF_RIGHTUP = 0x0010
MOUSEEVENTF_MIDDLEDOWN = 0x0020
MOUSEEVENTF_MIDDLEUP = 0x0040
MOUSEEVENTF_WHEEL = 0x0800

VK_LEFT = 0x25
VK_UP = 0x26
VK_RIGHT = 0x27
VK_DOWN = 0x28
VK_ESCAPE = 0x1B
VK_SPACE = 0x20
VK_PRIOR = 0x21  # Page Up
VK_NEXT = 0x22   # Page Down
VK_F5 = 0x74
VK_SHIFT = 0x10
VK_CONTROL = 0x11
VK_MENU = 0x12   # Alt
VK_TAB = 0x09
VK_RETURN = 0x0D
VK_B = 0x42      # B key (Blank screen in PowerPoint/Slides)
VK_W = 0x57      # W key (White screen)
VK_L = 0x4C      # L key
VK_P = 0x50      # P key
VK_VOLUME_MUTE = 0xAD
VK_VOLUME_DOWN = 0xAE
VK_VOLUME_UP = 0xAF

KEYEVENTF_KEYUP = 0x0002

def press_key(vk):
    u32.keybd_event(vk, 0, 0, 0)
    u32.keybd_event(vk, 0, KEYEVENTF_KEYUP, 0)

def press_combo(*vks):
    for vk in vks:
        u32.keybd_event(vk, 0, 0, 0)
    for vk in reversed(vks):
        u32.keybd_event(vk, 0, KEYEVENTF_KEYUP, 0)

def handle_input_action(data):
    action = data.get("action")
    
    if action == "move":
        dx = int(data.get("dx", 0))
        dy = int(data.get("dy", 0))
        if dx != 0 or dy != 0:
            u32.mouse_event(MOUSEEVENTF_MOVE, dx, dy, 0, 0)

    elif action == "click":
        button = data.get("button", "left")
        if button == "left":
            u32.mouse_event(MOUSEEVENTF_LEFTDOWN, 0, 0, 0, 0)
            u32.mouse_event(MOUSEEVENTF_LEFTUP, 0, 0, 0, 0)
        elif button == "right":
            u32.mouse_event(MOUSEEVENTF_RIGHTDOWN, 0, 0, 0, 0)
            u32.mouse_event(MOUSEEVENTF_RIGHTUP, 0, 0, 0, 0)
        elif button == "double":
            u32.mouse_event(MOUSEEVENTF_LEFTDOWN, 0, 0, 0, 0)
            u32.mouse_event(MOUSEEVENTF_LEFTUP, 0, 0, 0, 0)
            u32.mouse_event(MOUSEEVENTF_LEFTDOWN, 0, 0, 0, 0)
            u32.mouse_event(MOUSEEVENTF_LEFTUP, 0, 0, 0, 0)

    elif action == "mouse_down":
        button = data.get("button", "left")
        if button == "left":
            u32.mouse_event(MOUSEEVENTF_LEFTDOWN, 0, 0, 0, 0)
        elif button == "right":
            u32.mouse_event(MOUSEEVENTF_RIGHTDOWN, 0, 0, 0, 0)

    elif action == "mouse_up":
        button = data.get("button", "left")
        if button == "left":
            u32.mouse_event(MOUSEEVENTF_LEFTUP, 0, 0, 0, 0)
        elif button == "right":
            u32.mouse_event(MOUSEEVENTF_RIGHTUP, 0, 0, 0, 0)

    elif action == "scroll":
        dy = int(data.get("dy", 0))
        # Windows wheel: positive is away from user (scroll up), negative is down
        u32.mouse_event(MOUSEEVENTF_WHEEL, 0, 0, int(dy * 120), 0)

    elif action == "key":
        cmd = data.get("cmd")
        if cmd == "next":
            press_key(VK_RIGHT)
        elif cmd == "prev":
            press_key(VK_LEFT)
        elif cmd == "f5":
            press_key(VK_F5)
        elif cmd == "shift_f5":
            press_combo(VK_SHIFT, VK_F5)
        elif cmd == "escape":
            press_key(VK_ESCAPE)
        elif cmd == "blank":
            press_key(VK_B)
        elif cmd == "white":
            press_key(VK_W)
        elif cmd == "laser":
            press_combo(VK_CONTROL, VK_L)
        elif cmd == "pen":
            press_combo(VK_CONTROL, VK_P)
        elif cmd == "space":
            press_key(VK_SPACE)
        elif cmd == "tab":
            press_key(VK_TAB)
        elif cmd == "enter":
            press_key(VK_RETURN)
        elif cmd == "vol_up":
            press_key(VK_VOLUME_UP)
        elif cmd == "vol_down":
            press_key(VK_VOLUME_DOWN)
        elif cmd == "vol_mute":
            press_key(VK_VOLUME_MUTE)

# --- Network & IP Detection ---
def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

# --- WebSocket Server ---
async def ws_handler(websocket):
    client_ip = websocket.remote_address[0]
    print(f"\n[+] Phone Connected from: {client_ip}")
    try:
        await websocket.send(json.dumps({"status": "connected", "message": "Ready to control"}))
        async for message in websocket:
            try:
                data = json.loads(message)
                handle_input_action(data)
            except Exception:
                pass
    except websockets.exceptions.ConnectionClosed:
        pass
    finally:
        print(f"[-] Phone Disconnected: {client_ip}")

# --- Static HTTP Server Thread ---
class CustomHTTPHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        static_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")
        super().__init__(*args, directory=static_dir, **kwargs)
    
    def log_message(self, format, *args):
        pass

def run_http_server(host, port):
    httpd = ThreadingHTTPServer((host, port), CustomHTTPHandler)
    httpd.serve_forever()

def print_banner(ip, http_port, ws_port):
    url = f"http://{ip}:{http_port}"
    print("=" * 64)
    print("   OPTILOAD PRESENTER - WIRELESS IPHONE/MOBILE REMOTE")
    print("=" * 64)
    print(f"\n1. Make sure your iPhone 7 is on the same Wi-Fi network.")
    print(f"2. Open Safari or Camera on your iPhone and go to:")
    print(f"\n   >>>  {url}  <<<\n")
    
    try:
        import qrcode
        qr = qrcode.QRCode(border=1)
        qr.add_data(url)
        qr.make(fit=True)
        print("Scan this QR Code with your iPhone Camera:\n")
        qr.print_ascii(invert=True)
    except Exception:
        print(f"Open Safari on your phone and browse to: {url}")
        
    print("=" * 64)
    print(f"[HTTP Web UI] Running on: {url}")
    print(f"[WebSocket]   Port: {ws_port}")
    print("Keep this terminal open while presenting! (Press Ctrl+C to stop)")
    print("=" * 64 + "\n")

async def main():
    ip = get_local_ip()
    http_port = 8000
    ws_port = 8765

    # Start HTTP server in background thread
    http_thread = threading.Thread(target=run_http_server, args=("0.0.0.0", http_port), daemon=True)
    http_thread.start()

    print_banner(ip, http_port, ws_port)

    # Start WebSocket Server
    async with websockets.serve(ws_handler, "0.0.0.0", ws_port):
        await asyncio.Future()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nPresenter server stopped.")
