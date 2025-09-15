# file: app/models.py
from sqlalchemy import Column, String, Integer, Float, DateTime, JSON, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.db import Base

def gen_id(prefix: str = ""):
    return (prefix + "-" if prefix else "") + str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=lambda: gen_id("usr"))
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    workspaces = relationship("Workspace", back_populates="owner")

class Commodity(Base):
    __tablename__ = "commodities"
    symbol = Column(String(32), primary_key=True)
    name = Column(String(255), nullable=False)
    sector = Column(String(64), nullable=True)
    hubs = Column(JSON, nullable=True)
    description = Column(Text, nullable=True)

class MarketTick(Base):
    __tablename__ = "market_ticks"
    id = Column(String, primary_key=True, default=lambda: gen_id("tick"))
    symbol = Column(String(32), index=True, nullable=False)
    price = Column(Float, nullable=False)
    ts = Column(DateTime, index=True, default=datetime.utcnow)

class OHLC(Base):
    __tablename__ = "ohlc"
    id = Column(String, primary_key=True, default=lambda: gen_id("ohlc"))
    symbol = Column(String(32), index=True, nullable=False)
    interval = Column(String(16), nullable=False)  # e.g., 1h, 1d
    t = Column(DateTime, index=True, nullable=False)
    open = Column(Float)
    high = Column(Float)
    low = Column(Float)
    close = Column(Float)
    volume = Column(Float)

class StorageLevel(Base):
    __tablename__ = "storage_levels"
    id = Column(String, primary_key=True, default=lambda: gen_id("stg"))
    symbol = Column(String(32), index=True, nullable=False)
    region = Column(String(64), index=True, nullable=False)
    ts = Column(DateTime, index=True, nullable=False)
    level = Column(Float, nullable=False)
    avg_5y = Column(Float, nullable=True)

class Workspace(Base):
    __tablename__ = "workspaces"
    id = Column(String, primary_key=True, default=lambda: gen_id("ws"))
    owner_id = Column(String, ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False)
    layout = Column(JSON, default={})
    widgets = Column(JSON, default=[])
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="workspaces")

class AlertRule(Base):
    __tablename__ = "alerts"
    id = Column(String, primary_key=True, default=lambda: gen_id("al"))
    owner_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    type = Column(String(32), nullable=False)
    symbol = Column(String(32), nullable=True)
    condition = Column(JSON, nullable=False)
    channels = Column(JSON, default=["websocket"])
    created_at = Column(DateTime, default=datetime.utcnow)

class Report(Base):
    __tablename__ = "reports"
    id = Column(String, primary_key=True, default=lambda: gen_id("rpt"))
    owner_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    template = Column(String(255), nullable=False)
    workspace_id = Column(String, nullable=True)
    format = Column(String(16), default="pdf")
    status = Column(String(32), default="pending")
    s3_url = Column(String(1024), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
