# file: app/api/commodities.py
from fastapi import APIRouter
from app.schemas.schemas import CommoditySummary, CommodityDetail

router = APIRouter()

# demo list
_COMMODS = {
    "NG": {"symbol": "NG", "name": "Natural Gas", "sector": "Energy", "hubs": ["Henry Hub", "TTF", "JKM"], "description": "Natural gas global market"},
    "WTI": {"symbol": "WTI", "name": "Crude Oil WTI", "sector": "Energy", "hubs": ["Cushing"], "description": "West Texas Intermediate"},
}

@router.get("/", response_model=list[CommoditySummary])
def list_commodities():
    return list(_COMMODS.values())

@router.get("/{symbol}", response_model=CommodityDetail)
def get_commodity(symbol: str):
    c = _COMMODS.get(symbol.upper())
    if not c:
        raise HTTPException(status_code=404, detail="Commodity not found")
    return c
