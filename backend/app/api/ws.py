# file: app/api/ws.py
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, List
import asyncio
from app.api.market_data import _tick_store
from app.schemas    .schemas import PriceTick
from datetime import datetime
import random
import json

router = APIRouter()

# Simple connection manager
class ConnectionManager:
    def __init__(self):
        self.active: Dict[str, List[WebSocket]] = {}  # symbol -> websockets

    async def connect(self, websocket: WebSocket, symbol: str):
        await websocket.accept()
        self.active.setdefault(symbol, []).append(websocket)

    def disconnect(self, websocket: WebSocket, symbol: str):
        conns = self.active.get(symbol, [])
        if websocket in conns:
            conns.remove(websocket)

    async def broadcast(self, symbol: str, message: dict):
        conns = list(self.active.get(symbol, []))
        for ws in conns:
            try:
                await ws.send_json(message)
            except Exception:
                # ignore broken sockets; disconnect will be cleaned elsewhere
                pass

manager = ConnectionManager()

# background tick generator task (runs forever)
async def _tick_generator():
    """
    Generates synthetic ticks every second and broadcasts them to connected clients.
    Uses json.loads(t.json()) to ensure datetime -> ISO strings are serialized.
    """
    while True:
        await asyncio.sleep(1)  # 1s tick interval
        for symbol in list(_tick_store.keys()):
            last_price = _tick_store[symbol][-1].price
            # simulate small move
            new_price = round(last_price * (1 + random.uniform(-0.0015, 0.0015)), 6)
            new_tick = PriceTick(symbol=symbol, price=new_price, ts=datetime.utcnow())
            _tick_store[symbol].append(new_tick)
            # keep last 1000
            _tick_store[symbol] = _tick_store[symbol][-1000:]
            # broadcast if listeners exist - ensure the payload is JSON serializable
            asyncio.create_task(manager.broadcast(symbol, json.loads(new_tick.json())))


# launch generator in background when module imported
# note: if your environment raises "no running event loop", create_task here may need to be started differently.
asyncio.get_event_loop().create_task(_tick_generator())


@router.websocket("/ws/market/{symbol}")
async def ws_market(websocket: WebSocket, symbol: str):
    sym = symbol.upper()
    await manager.connect(websocket, sym)
    try:
        # send initial snapshot (serialize each tick)
        ticks = _tick_store.get(sym, [])
        snapshot_ticks = [json.loads(t.json()) for t in ticks[-50:]]
        await websocket.send_json({"type": "snapshot", "symbol": sym, "ticks": snapshot_ticks})

        while True:
            # keep connection alive; client may send pings or commands
            data = await websocket.receive_text()
            # respond to ping messages if desired
            if data.lower() in ("ping", "keepalive"):
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        manager.disconnect(websocket, sym)
