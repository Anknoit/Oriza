# file: app/schemas.py
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# --- Auth/User ---
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int = 3600

class UserCreate(BaseModel):
    email: str
    full_name: Optional[str]

class UserProfile(BaseModel):
    id: str
    email: str
    full_name: Optional[str]

# --- Commodities ---
class CommoditySummary(BaseModel):
    symbol: str
    name: str
    sector: Optional[str]
    hubs: Optional[List[str]] = []

class CommodityDetail(CommoditySummary):
    description: Optional[str]

# --- Market data ---
class PriceTick(BaseModel):
    symbol: str
    price: float
    ts: datetime

class OHLCPoint(BaseModel):
    t: datetime
    open: float
    high: float
    low: float
    close: float
    volume: Optional[float] = None

class OHLCSeries(BaseModel):
    symbol: str
    interval: str
    series: List[OHLCPoint]

# --- Supply ---
class StorageLevel(BaseModel):
    symbol: str
    region: str
    ts: datetime
    level: float
    avg_5y: Optional[float] = None

# --- Weather ---
class ForecastPoint(BaseModel):
    date: datetime
    temp_max: float
    temp_min: float
    hdd: Optional[float] = None
    cdd: Optional[float] = None

class ForecastResponse(BaseModel):
    region: str
    model: str
    horizon_days: int
    series: List[ForecastPoint]

# --- Workspaces ---
class WorkspaceCreate(BaseModel):
    name: str
    layout: Dict[str, Any] = {}
    widgets: List[Dict[str, Any]] = []

class WorkspaceResponse(WorkspaceCreate):
    id: str
    owner_id: str

# --- Alerts ---
class AlertRule(BaseModel):
    id: Optional[str]
    owner_id: Optional[str]
    type: str  # e.g., price, storage, weather
    symbol: Optional[str]
    condition: Dict[str, Any]
    channels: List[str] = ["websocket"]

class AlertExecution(BaseModel):
    alert_id: str
    ts: datetime
    triggered_value: Any

# --- Reports ---
class ReportRequest(BaseModel):
    template: str
    workspace_id: Optional[str]
    format: str = "pdf"  # pdf or xlsx

class ReportResponse(BaseModel):
    report_id: str
    status: str
