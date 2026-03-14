import os
import json
import numpy as np
import pandas as pd
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from apscheduler.schedulers.background import BackgroundScheduler

from schemas import (
    StressReading, IndicatorReading, NewsItem, 
    HistoricalAnalog, LiveResponse, HistoricalPoint, 
    HistoricalResponse, HealthResponse
)
from model import ml_model
from data import refresh_cache, get_cache, get_stress_level

startup_time = None
_historical_df = pd.DataFrame()
_crisis_periods = []
_analogs = []

@asynccontextmanager
async def lifespan(app: FastAPI):
    global startup_time, _historical_df, _crisis_periods, _analogs
    startup_time = datetime.now()
    
    artifacts_dir = os.getenv("ARTIFACTS_DIR", "artifacts")
    try:
        ml_model.load(artifacts_dir)
    except FileNotFoundError:
        print("No artifacts found. Place files in artifacts/ directory.")
        print("    Endpoints will return fallback data.")

    try:
        hist_path = os.path.join(artifacts_dir, "historical_stress.parquet")
        if os.path.exists(hist_path):
            _historical_df = pd.read_parquet(hist_path)
    except Exception as e:
        print(f"Failed to load historical parquet: {e}")

    try:
        cp_path = os.path.join(artifacts_dir, "crisis_periods.json")
        if os.path.exists(cp_path):
            with open(cp_path, 'r') as f:
                _crisis_periods = json.load(f)
    except Exception as e:
        print(f"Failed to load crisis periods: {e}")

    try:
        an_path = os.path.join(artifacts_dir, "today_analogs.json")
        if os.path.exists(an_path):
            with open(an_path, 'r') as f:
                _analogs = json.load(f)
    except Exception as e:
        print(f"Failed to load analogs: {e}")

    refresh_cache()

    scheduler = BackgroundScheduler()
    interval = int(os.getenv("REFRESH_INTERVAL", 60))
    scheduler.add_job(refresh_cache, "interval", seconds=interval)
    scheduler.start()

    print("╔════════════════════════════════╗")
    print("║   CRASHSIGNAL API  v1.0.0      ║")
    print("║   http://localhost:8000        ║")
    print("║   /docs → API explorer         ║")
    print("╚════════════════════════════════╝")
    
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def build_live_response() -> LiveResponse:
    cache = get_cache()
    indicators = cache["indicators"]
    news = cache["news"]

    indicator_readings = []
    for key, data in indicators.items():
        indicator_readings.append(IndicatorReading(
            name=data["name"], key=key,
            value=data["value"],
            change_pct=data["change_pct"],
            is_stressed=data["is_stressed"],
            stress_contribution=data["stress_contribution"],
            direction=data["direction"],
            color=data["color"]
        ))

    indicator_readings.sort(key=lambda x: x.stress_contribution, reverse=True)

    contributions = [i.stress_contribution for i in indicator_readings if i.value is not None]
    indicator_avg = np.mean(contributions) if contributions else 50.0
    news_stress = news.get("stress_score", 50)
    combined = float(np.clip(indicator_avg * 0.80 + news_stress * 0.20, 0, 100))

    level, color = get_stress_level(combined)

    stress = StressReading(
        score=round(combined, 1),
        level=level,
        color=color,
        timestamp=datetime.now().isoformat(),
        market_date=datetime.now().strftime("%Y-%m-%d")
    )

    news_items = [NewsItem(**item) for item in news.get("items", [])[:8]]
    analogs = [HistoricalAnalog(**a) for a in _analogs[:3]]

    return LiveResponse(
        stress=stress,
        indicators=indicator_readings,
        news_stress=round(news_stress, 1),
        news_items=news_items,
        analogs=analogs,
        components={
            "indicator": round(indicator_avg, 1),
            "news": round(news_stress, 1),
            "combined": round(combined, 1)
        },
        last_updated=cache.get("last_updated", "never")
    )

@app.get("/health", response_model=HealthResponse)
def health():
    cache = get_cache()
    uptime_seconds = (datetime.now() - startup_time).total_seconds() if startup_time else 0.0
    return HealthResponse(
        status="ok",
        model_loaded=ml_model.loaded,
        last_updated=cache.get("last_updated") or "never",
        uptime_seconds=uptime_seconds,
        refresh_count=cache.get("update_count", 0)
    )

@app.get("/live", response_model=LiveResponse)
def live():
    try:
        return build_live_response()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/history", response_model=HistoricalResponse)
def history():
    if _historical_df.empty:
        return HistoricalResponse(points=[], crisis_periods=_crisis_periods, total_days=0)
    
    points = []
    for _, row in _historical_df.iterrows():
        points.append(dict(row))
    
    pts = [HistoricalPoint(**p) for p in points]
    return HistoricalResponse(points=pts, crisis_periods=_crisis_periods, total_days=len(pts))

@app.get("/indicators")
def get_indicators():
    cache = get_cache()
    return {
        "indicators": cache["indicators"],
        "last_updated": cache["last_updated"],
        "count": len(cache["indicators"])
    }

@app.get("/news")
def get_news():
    cache = get_cache()
    return cache["news"]

@app.post("/refresh")
def force_refresh():
    refresh_cache()
    cache = get_cache()
    return {
        "status": "ok",
        "timestamp": datetime.now().isoformat(),
        "update_count": cache["update_count"]
    }
