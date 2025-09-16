<!-- file: README.md -->

<p align="center">
  <img src="https://raw.githubusercontent.com/your-username/oriza/main/docs/banner.png" alt="Oriza Banner" width="100%" />
</p>

<h1 align="center">🌾 Oriza</h1>
<p align="center">
  <i>"Oriza" — Latin for Rice, the foundation commodity of civilization.</i><br/>
  A next-generation <b>Commodity Dashboard</b> that brings together all the data, insights, and analytics traders need to make smarter, faster trading decisions.
</p>

<p align="center">
  <a href="https://fastapi.tiangolo.com/"><img src="https://img.shields.io/badge/FastAPI-0.95+-009688?logo=fastapi" alt="FastAPI"></a>
  <a href="https://www.postgresql.org/"><img src="https://img.shields.io/badge/Postgres-14+-336791?logo=postgresql" alt="Postgres"></a>
  <a href="https://scrapy.org/"><img src="https://img.shields.io/badge/Scrapy-Framework-65b32e?logo=python" alt="Scrapy"></a>
  <a href="https://playwright.dev/python/"><img src="https://img.shields.io/badge/React-Frontend-green?logo=react" alt="React"></a>
  <a href="https://alembic.sqlalchemy.org/"><img src="https://img.shields.io/badge/Alembic-Migrations-orange" alt="Alembic"></a>
</p>

---

## 📖 Overview
**Oriza** is a Bloomberg-like terminal for the **commodities world**, starting with energy (Natural Gas, Crude, etc.) and extending to agriculture, metals, and beyond.  
The platform ingests **market data, supply-demand drivers, weather, alternative data, and macro events** into one **real-time, customizable dashboard**.

Built for **traders, analysts, and researchers**, Oriza combines:

- Supply, storage, pipeline & shipping data.
- Weather forecasts & demand-side models.
- News & sentiment pipelines (RSS, APIs, Scrapy + Playwright).
- AI-driven analytics, forecasting & scenario testing.

---

## Features
- **Real-time Market Data**
  - OHLC charts, forward curves, options chains (planned).
- **Supply & Demand**
  - Storage levels, production stats, rig counts, pipeline & LNG flows.
- **Alternative Data**
  - Satellite flaring, port congestion, crop NDVI indices, sentiment analysis.
- **Macro & Events**
  - Currency (DXY), interest rates, inflation, OPEC/EIA events calendar.
- **News & Sentiment**
  - Real-time news ingestion pipeline with deduplication, AI summaries, and sentiment scoring.
- **Analytics**
  - Correlation matrices, volatility surfaces, scenario simulators.
- **Workspaces**
  - Bloomberg-like user dashboards with customizable layouts and widgets.
- **Alerts & Reports**
  - Custom conditions (price/storage/weather) with push/email/websocket delivery.
  - One-click PDF/Excel reports.

---

## 🚀 Getting Started
### 1. Clone Repo
```bash
git clone https://github.com/your-username/oriza.git
cd oriza
```

i. Backend API
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

createdb oriza

alembic upgrade head

uvicorn app.main:app --reload
```
Visit http://localhost:8000/docs for API docs.

ii. Frontend
```bash
cd project
npm i
npm run dev
```
Visit http://localhost:5173/ for frontend preview.

🤝 Contributing

- Contributions are welcome!
- Open issues for bugs & feature requests.
- PRs should follow Conventional Commits

<br>

<p align="center"> 🌾 <b>Oriza</b> — Foundation for Commodity Intelligence </p>
