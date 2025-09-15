# file: app/api/alerts.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.deps import get_db, get_current_user
from app.models import AlertRule
from app.schemas.schemas import AlertRule as AlertRuleSchema
import uuid

router = APIRouter()

@router.post("/")
async def create_alert(rule: AlertRuleSchema, db: AsyncSession = Depends(get_db), current=Depends(get_current_user)):
    aid = str(uuid.uuid4())
    db_obj = AlertRule(id=aid, owner_id=current.id, type=rule.type, symbol=rule.symbol, condition=rule.condition, channels=rule.channels)
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj

@router.get("/")
async def list_alerts(db: AsyncSession = Depends(get_db), current=Depends(get_current_user)):
    q = await db.execute(select(AlertRule).where(AlertRule.owner_id == current.id))
    return q.scalars().all()

@router.delete("/{aid}")
async def delete_alert(aid: str, db: AsyncSession = Depends(get_db), current=Depends(get_current_user)):
    q = await db.execute(select(AlertRule).where(AlertRule.id == aid, AlertRule.owner_id == current.id))
    obj = q.scalar_one_or_none()
    if not obj:
        raise HTTPException(status_code=404, detail="not found")
    await db.delete(obj)
    await db.commit()
    return {"ok": True}
