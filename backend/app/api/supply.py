# file: app/api/supply.py
from fastapi import APIRouter
from datetime import datetime, timedelta
from app.schemas.schemas import StorageLevel
import random

router = APIRouter()

# demo storage dataset (weekly)
_storage_demo = {}
def _seed_storage(symbol="NG", region="US"):
    now = datetime.utcnow()
    rows = []
    base = 3000.0
    for w in range(0, 52):
        ts = now - timedelta(weeks=52-w)
        level = base * (1 + random.uniform(-0.2, 0.2))
        rows.append(StorageLevel(symbol=symbol, region=region, ts=ts, level=round(level,2), avg_5y=base))
    _storage_demo[f"{symbol}-{region}"] = rows

_seed_storage()

@router.get("/{symbol}/storage", response_model=list[StorageLevel])
def get_storage(symbol: str, region: str = "US"):
    key = f"{symbol.upper()}-{region.upper()}"
    if key not in _storage_demo:
        _seed_storage(symbol.upper(), region.upper())
    return _storage_demo[key]
