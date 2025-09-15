# file: app/api/commodities.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.deps import get_db
from app.models import Commodity

router = APIRouter()

@router.get("/")
async def list_commodities(db: AsyncSession = Depends(get_db)):
    q = await db.execute(select(Commodity))
    rows = q.scalars().all()
    return rows

@router.get("/{symbol}")
async def get_commodity(symbol: str, db: AsyncSession = Depends(get_db)):
    q = await db.execute(select(Commodity).where(Commodity.symbol == symbol.upper()))
    c = q.scalar_one_or_none()
    if not c:
        raise HTTPException(status_code=404, detail="Commodity not found")
    return c
