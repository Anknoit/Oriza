# file: app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, users, commodities, market_data, supply, weather, ws, workspaces, alerts, reports

app = FastAPI(title="Tasaar Oriza - MVP")

# CORS (adjust origins as needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# include routers
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(commodities.router, prefix="/commodities", tags=["commodities"])
app.include_router(market_data.router, prefix="/market", tags=["market"])
app.include_router(supply.router, prefix="/supply", tags=["supply"])
app.include_router(weather.router, prefix="/weather", tags=["weather"])
app.include_router(ws.router, tags=["ws"])  # websockets
app.include_router(workspaces.router, prefix="/workspaces", tags=["workspaces"])
app.include_router(alerts.router, prefix="/alerts", tags=["alerts"])
app.include_router(reports.router, prefix="/reports", tags=["reports"])

@app.get("/health", tags=["system"])
def health():
    return {"status": "ok"}
