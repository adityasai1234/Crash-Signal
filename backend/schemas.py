from pydantic import BaseModel
from typing import Optional

class StressReading(BaseModel):
    score: float           # 0-100
    level: str             # LOW/MODERATE/ELEVATED/HIGH/EXTREME
    color: str             # hex color matching level
    timestamp: str         # ISO format
    market_date: str       # YYYY-MM-DD

class IndicatorReading(BaseModel):
    name: str              # display name
    key: str               # internal key e.g. "vix"
    value: Optional[float] # current value, None if fetch failed
    change_pct: float      # % change from previous
    is_stressed: bool      # above/below stress threshold
    stress_contribution: float  # 0-100
    direction: str         # UP/DOWN/NEUTRAL
    color: str             # hex

class NewsItem(BaseModel):
    headline: str
    sentiment: str         # positive/negative/neutral
    score: float           # 0-1 negativity score
    source: str

class HistoricalAnalog(BaseModel):
    date: str
    similarity: float      # 0-1 cosine similarity
    stress_score: float
    label: str             # Normal/Stress/Crisis

class LiveResponse(BaseModel):
    stress: StressReading
    indicators: list[IndicatorReading]
    news_stress: float
    news_items: list[NewsItem]
    analogs: list[HistoricalAnalog]
    components: dict       # {indicator, news, combined}
    last_updated: str

class HistoricalPoint(BaseModel):
    date: str
    stress_score: float
    predicted_label: int
    crisis_label: int

class HistoricalResponse(BaseModel):
    points: list[HistoricalPoint]
    crisis_periods: list[dict]
    total_days: int

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    last_updated: str
    uptime_seconds: float
    refresh_count: int
