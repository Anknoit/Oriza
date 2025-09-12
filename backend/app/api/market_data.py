# file: app/api/market_data.py
from fastapi import APIRouter, Query
from datetime import datetime, timedelta
from typing import List
from app.schemas.schemas import PriceTick, OHLCSeries, OHLCPoint
import random

router = APIRouter()

# in-memory tick store (latest N ticks per symbol)
_tick_store: dict[str, List[PriceTick]] = {}
_ohlc_cache: dict[str, OHLCSeries] = {}

def _seed_symbol(symbol: str, base_price: float = 100.0):
    # generate some fake ticks and ohlc for demo
    symbol = symbol.upper()
    now = datetime.utcnow()
    ticks = []
    price = base_price
    for i in range(60):
        price = price * (1 + random.uniform(-0.002, 0.002))
        ticks.append(PriceTick(symbol=symbol, price=round(price, 4), ts=now - timedelta(seconds=(60 - i))))
    _tick_store[symbol] = ticks

    # simple OHLC: produce 24 hourly candles
    series = []
    for h in range(24):
        o = base_price * (1 + random.uniform(-0.02, 0.02))
        c = o * (1 + random.uniform(-0.01, 0.01))
        hi = max(o, c) * (1 + random.uniform(0, 0.01))
        lo = min(o, c) * (1 - random.uniform(0, 0.01))
        series.append(OHLCPoint(t=now - timedelta(hours=23 - h), open=round(o,4), high=round(hi,4), low=round(lo,4), close=round(c,4)))
    _ohlc_cache[symbol] = OHLCSeries(symbol=symbol, interval="1h", series=series)

# seed demo symbols
_seed_symbol("NG", base_price=3.5)
_seed_symbol("WTI", base_price=80.0)

@router.get("/{symbol}/tick", response_model=List[PriceTick])
def get_ticks(symbol: str, limit: int = Query(100, ge=1, le=1000)):
    symbol = symbol.upper()
    if symbol not in _tick_store:
        _seed_symbol(symbol, base_price=50.0)
    return list(reversed(_tick_store[symbol][-limit:]))

@router.get("/{symbol}/ohlc", response_model=OHLCSeries)
def get_ohlc(symbol: str, interval: str = "1h"):
    symbol = symbol.upper()
    if symbol not in _ohlc_cache:
        _seed_symbol(symbol, base_price=50.0)
    # note: interval argument ignored in this stub (always 1h). Extend as needed.
    return _ohlc_cache[symbol]
