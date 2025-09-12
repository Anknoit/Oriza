# file: app/api/weather.py
from fastapi import APIRouter, Query
from datetime import datetime, timedelta
from app.schemas.schemas import ForecastResponse, ForecastPoint
import random

router = APIRouter()

@router.get("/region/{region}/forecast", response_model=ForecastResponse)
def get_forecast(region: str, horizon: int = Query(7, ge=1, le=30), model: str = "demo-model"):
    # demo synthetic forecast
    now = datetime.utcnow()
    series = []
    for d in range(horizon):
        day = now + timedelta(days=d)
        tmin = random.uniform(0, 15)
        tmax = tmin + random.uniform(5, 20)
        # simple HDD/CDD
        hdd = max(0, 18 - ((tmin + tmax)/2))
        cdd = max(0, ((tmin + tmax)/2) - 18)
        series.append(ForecastPoint(date=day, temp_max=round(tmax,1), temp_min=round(tmin,1), hdd=round(hdd,2), cdd=round(cdd,2)))
    return ForecastResponse(region=region, model=model, horizon_days=horizon, series=series)
