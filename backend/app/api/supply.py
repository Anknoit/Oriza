# file: app/api/supply.py
from fastapi import APIRouter, Depends
from datetime import datetime, timedelta
from app.schemas.schemas import StorageLevel
import random
# file: app/api/supply.py
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import StorageLevel
from app.deps import get_db


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



@router.get("/{symbol}/storage")
async def get_storage(symbol: str, region: str = "US", db: AsyncSession = Depends(get_db)):
    q = await db.execute(
        select(StorageLevel)
        .where(StorageLevel.symbol == symbol.upper(), StorageLevel.region == region.upper())
        .order_by(desc(StorageLevel.ts))
        .limit(500)
    )
    rows = q.scalars().all()
    return list(rows)
