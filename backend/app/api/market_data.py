# file: app/api/market_data.py
from fastapi import APIRouter, Query, Depends
from datetime import datetime, timedelta
from typing import List
from app.schemas.schemas import PriceTick, OHLCSeries, OHLCPoint
import random

from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from app.deps import get_db
from app.models import MarketTick

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


@router.get("/{symbol}/tick")
async def get_ticks(symbol: str, limit: int = Query(100, ge=1, le=1000), db: AsyncSession = Depends(get_db)):
    q = await db.execute(select(MarketTick).where(MarketTick.symbol == symbol.upper()).order_by(desc(MarketTick.ts)).limit(limit))
    rows = q.scalars().all()
    return list(rows)

# helper to append simulated tick to DB (you might run this from a background worker)
async def add_simulated_tick(symbol: str, price: float, db: AsyncSession):
    tick = MarketTick(symbol=symbol.upper(), price=price, ts=datetime.utcnow())
    db.add(tick)
    await db.commit()
    await db.refresh(tick)
    return tick

# quick endpoint to generate a tick (demo only)
@router.post("/{symbol}/tick")
async def push_tick(symbol: str, price: float, db: AsyncSession = Depends(get_db)):
    tick = MarketTick(symbol=symbol.upper(), price=price)
    db.add(tick)
    await db.commit()
    await db.refresh(tick)
    return tick


