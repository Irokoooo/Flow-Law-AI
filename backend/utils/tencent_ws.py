"""Tencent Cloud Agent WebSocket client helper (synchronous wrapper).

IMPORTANT:
- This is a scaffold based on the public doc pattern; adjust 'WS_ENDPOINT_PATH', payload shape and finish signals
  according to the official spec: https://cloud.tencent.com/document/product/1759/109380
- Replace any placeholder keys with secure runtime environment variables.
- For production, consider an async implementation (e.g., using 'websockets' + asyncio) and streaming to the client via SSE.

Basic usage:
    from utils.tencent_ws import ws_agent_chat
    result = ws_agent_chat(
        appkey=APPKEY,
        secret_id=..., secret_key=...,
        message='合同中争议解决条款的合规风险？',
        model='general-lawflow',
        endpoint='wss://example.tencentcloudapi.com/websocket'
    )

Return value: dict with keys: text, suggestions(list), raw_messages(list)
"""
from __future__ import annotations
import json
import time
import traceback
from typing import List, Dict, Optional

try:
    import websocket  # websocket-client
except ImportError:  # Graceful degradation
    websocket = None  # type: ignore

DEFAULT_TIMEOUT = 25
FINISH_EVENT_KEYS = {"done", "finish", "completed"}  # Adjust to real protocol


def _build_ws_payload(appkey: str, secret_id: str, secret_key: str, model: str, message: str) -> dict:
    """Construct the outbound payload. Adjust fields per official API contract.
    Some Tencent real-time agent services use a layered structure, e.g. action + data.
    """
    return {
        "action": "chat",
        "appkey": appkey,
        "auth": {
            "secret_id": secret_id,
            "secret_key": secret_key,
        },
        "model": model,
        "messages": [
            {"role": "user", "content": message}
        ],
        "stream": True
    }


def ws_agent_chat(appkey: str, secret_id: str, secret_key: str, model: str, message: str, endpoint: str, timeout: int = DEFAULT_TIMEOUT) -> Dict:
    if websocket is None:
        return {
            "text": "[WS占位] websocket-client 未安装，已回退。",
            "suggestions": ["安装 websocket-client 以启用 WebSocket 模式"],
            "raw_messages": []
        }

    ws = None
    received_chunks: List[str] = []
    raw_messages: List[Dict] = []
    start_time = time.time()

    try:
        ws = websocket.create_connection(endpoint, timeout=timeout)
        payload = _build_ws_payload(appkey, secret_id, secret_key, model, message)
        ws.send(json.dumps(payload, ensure_ascii=False))

        while True:
            if time.time() - start_time > timeout:
                break
            raw = ws.recv()
            if not raw:
                continue
            try:
                data = json.loads(raw)
            except Exception:
                # Non-JSON frame -> skip or store as text
                raw_messages.append({"type": "text", "data": raw})
                continue
            raw_messages.append(data)

            # Expect structure like {event: 'delta'|'done', data:{...}}; adapt as needed
            event_key = str(data.keys()).lower()
            # Heuristics: if keys indicate finish OR explicit flag inside
            if any(k in FINISH_EVENT_KEYS for k in data.keys()) or data.get('event') in FINISH_EVENT_KEYS:
                break

            # Try to extract partial content
            chunk = (data.get('delta') or data.get('text') or data.get('content') or '')
            if isinstance(chunk, str) and chunk:
                received_chunks.append(chunk)
        # End loop
    except Exception as e:
        return {
            "text": f"[WS错误] {e}",
            "suggestions": ["检查 endpoint 与 appkey", "核对网络连通性", "确认签名/权限配置"],
            "raw_messages": raw_messages
        }
    finally:
        if ws:
            try:
                ws.close()
            except Exception:
                pass

    full_text = ''.join(received_chunks) if received_chunks else '[WS未返回内容]'
    return {
        "text": full_text,
        "suggestions": [],
        "raw_messages": raw_messages
    }

if __name__ == '__main__':
    print("Self-test placeholder (no real endpoint)")
    res = ws_agent_chat("APPKEY_PLACEHOLDER", "SID", "SKEY", "demo-model", "你好", "wss://example.test/ws")
    print(res)
