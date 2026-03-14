import os
import json
import numpy as np
import pandas as pd
import yfinance as yf
from fredapi import Fred
from datetime import datetime, timedelta
from dotenv import load_dotenv
import requests
import warnings
warnings.filterwarnings("ignore")

load_dotenv()

fred = Fred(api_key=os.getenv("FRED_API_KEY", ""))

INDICATORS = {
    "vix":                  {"src": "yahoo", "ticker": "^VIX"},
    "ted_spread":           {"src": "fred",  "series": "TEDRATE"},
    "yield_curve":          {"src": "fred",  "series": "T10Y2Y"},
    "credit_spread_hy":     {"src": "fred",  "series": "BAMLH0A0HYM2"},
    "credit_spread_ig":     {"src": "fred",  "series": "BAMLC0A0CM"},
    "financial_conditions": {"src": "fred",  "series": "NFCI"},
    "bank_stress":          {"src": "fred",  "series": "DPCREDIT"},
    "unemployment_claims":  {"src": "fred",  "series": "ICSA"},
    "consumer_sentiment":   {"src": "fred",  "series": "UMCSENT"},
    "manufacturing_pmi":    {"src": "fred",  "series": "MANEMP"},
    "real_rates":           {"src": "fred",  "series": "DFII10"},
    "dollar_index":         {"src": "yahoo", "ticker": "DX-Y.NYB"},
    "gold_ratio":           {"src": "yahoo", "ticker": "GLD"},
    "vvix":                 {"src": "yahoo", "ticker": "^VVIX"},
    "sp500":                {"src": "yahoo", "ticker": "^GSPC"},
}

DISPLAY_NAMES = {
    "vix":                  "VIX Volatility",
    "ted_spread":           "TED Spread",
    "yield_curve":          "Yield Curve (10Y-2Y)",
    "credit_spread_hy":     "HY Credit Spread",
    "credit_spread_ig":     "IG Credit Spread",
    "financial_conditions": "Financial Conditions",
    "bank_stress":          "Bank Discount Borrowing",
    "unemployment_claims":  "Jobless Claims",
    "consumer_sentiment":   "Consumer Sentiment",
    "manufacturing_pmi":    "Manufacturing PMI",
    "real_rates":           "Real Interest Rate",
    "dollar_index":         "Dollar Index (DXY)",
    "gold_ratio":           "Gold ETF (GLD)",
    "vvix":                 "VIX of VIX",
    "sp500":                "S&P 500",
}

STRESS_THRESHOLDS = {
    "vix": 25, "ted_spread": 0.5, "yield_curve": 0.0,
    "credit_spread_hy": 6.0, "credit_spread_ig": 1.5,
    "financial_conditions": 0.2, "bank_stress": 500,
    "unemployment_claims": 350000,
    "consumer_sentiment": 65, "manufacturing_pmi": 50000,
    "real_rates": -0.5, "dollar_index": 103,
    "gold_ratio": 180, "vvix": 100, "sp500": 4000
}

STRESS_DIR = {
    "vix": "HIGH", "ted_spread": "HIGH", "credit_spread_hy": "HIGH",
    "credit_spread_ig": "HIGH", "financial_conditions": "HIGH",
    "bank_stress": "HIGH", "unemployment_claims": "HIGH",
    "dollar_index": "HIGH", "gold_ratio": "HIGH", "vvix": "HIGH",
    "yield_curve": "LOW", "consumer_sentiment": "LOW",
    "manufacturing_pmi": "LOW", "real_rates": "LOW", "sp500": "LOW"
}

def get_stress_level(score: float) -> tuple[str, str]:
    if score <= 25:
        return ("LOW", "#00d4aa")
    elif score <= 50:
        return ("MODERATE", "#4a9eff")
    elif score <= 75:
        return ("ELEVATED", "#ffd93d")
    elif score <= 90:
        return ("HIGH", "#ff8c00")
    else:
        return ("EXTREME", "#ff3333")

def compute_stress_contribution(key: str, value: float) -> tuple[bool, float]:
    threshold = STRESS_THRESHOLDS[key]
    direction = STRESS_DIR[key]
    
    is_stressed = (value > threshold if direction == "HIGH" else value < threshold)
    
    dist = abs(value - threshold)
    base = abs(threshold) + 1e-8
    contribution = min(100, (dist / base) * 50)
    if not is_stressed:
        contribution = max(0, 20 - contribution)
    
    return is_stressed, round(contribution, 2)

def get_direction(change_pct: float) -> str:
    if change_pct > 0.5:
        return "UP"
    if change_pct < -0.5:
        return "DOWN"
    return "NEUTRAL"

def fetch_yahoo(ticker: str) -> dict:
  """
  Fetch latest close + prev close from yfinance.
  Returns dict with value, prev, change_pct, date.
  Returns {value: None, change_pct: 0} on any failure.
  Never raises.
  """
  try:
    t    = yf.Ticker(ticker)
    hist = t.history(period="5d")
    if len(hist) < 2:
      return {"value": None, "change_pct": 0, "date": None}
    val    = float(hist["Close"].iloc[-1])
    prev   = float(hist["Close"].iloc[-2])
    change = (val - prev) / abs(prev) * 100 if prev != 0 else 0
    return {
      "value":      round(val, 4),
      "prev":       round(prev, 4),
      "change_pct": round(change, 3),
      "date":       str(hist.index[-1].date())
    }
  except Exception as e:
    print(f"Yahoo fetch failed {ticker}: {e}")
    return {"value": None, "change_pct": 0, "date": None}

def fetch_fred_series(series: str) -> dict:
  """
  Fetch latest value from FRED.
  Looks back 90 days for weekend/holiday gaps.
  Returns dict with value, prev, change_pct, date.
  Returns {value: None, change_pct: 0} on any failure.
  Never raises.
  """
  try:
    since = (datetime.today() - timedelta(days=90)).strftime("%Y-%m-%d")
    s = fred.get_series(series, observation_start=since)
    s = s.dropna()
    if len(s) < 2:
      return {"value": None, "change_pct": 0, "date": None}
    val    = float(s.iloc[-1])
    prev   = float(s.iloc[-2])
    change = (val - prev) / abs(prev) * 100 if prev != 0 else 0
    return {
      "value":      round(val, 6),
      "prev":       round(prev, 6),
      "change_pct": round(change, 3),
      "date":       str(s.index[-1].date())
    }
  except Exception as e:
    print(f"FRED fetch failed {series}: {e}")
    return {"value": None, "change_pct": 0, "date": None}

def fetch_all_indicators() -> dict:
  """
  Fetch all 15 indicators.
  Returns dict keyed by indicator name.
  Each value is a complete IndicatorReading-ready dict.
  Failed fetches return value=None but never crash.
  """
  results = {}
  for key, cfg in INDICATORS.items():
    if cfg["src"] == "yahoo":
      raw = fetch_yahoo(cfg["ticker"])
    else:
      raw = fetch_fred_series(cfg["series"])

    val = raw.get("value")

    if val is not None:
      is_stressed, contrib = compute_stress_contribution(key, val)
    else:
      is_stressed, contrib = False, 0.0

    change  = raw.get("change_pct", 0.0)
    _, color = get_stress_level(contrib if is_stressed else 20)

    results[key] = {
      "name":               DISPLAY_NAMES[key],
      "key":                key,
      "value":              val,
      "change_pct":         change,
      "is_stressed":        is_stressed,
      "stress_contribution":contrib,
      "direction":          get_direction(change),
      "color":              color,
      "date":               raw.get("date")
    }
  return results

_finbert_tokenizer = None
_finbert_model     = None

def _load_finbert():
  """Load FinBERT once. Cache in module globals."""
  global _finbert_tokenizer, _finbert_model
  if _finbert_tokenizer is None:
    from transformers import (
      BertTokenizer,
      BertForSequenceClassification
    )
    import torch
    print("Loading FinBERT...")
    _finbert_tokenizer = BertTokenizer.from_pretrained(
      "ProsusAI/finbert"
    )
    _finbert_model = BertForSequenceClassification.from_pretrained(
        "ProsusAI/finbert"
    )
    _finbert_model.eval()
    print("FinBERT loaded")
  return _finbert_tokenizer, _finbert_model

def fetch_news_sentiment() -> dict:
  fallback = {"stress_score": 50.0, "items": []}
  api_key = os.getenv("NEWS_API_KEY")
  if not api_key:
    return fallback

  try:
    url = "https://newsapi.org/v2/everything"
    params = {
      "q": "stock market OR recession OR Federal Reserve OR inflation OR financial crisis OR interest rates",
      "from": (datetime.today() - timedelta(days=1)).strftime("%Y-%m-%d"),
      "sortBy": "publishedAt",
      "language": "en",
      "pageSize": 30,
      "apiKey": api_key
    }
    resp = requests.get(url, params=params, timeout=10)
    if resp.status_code != 200:
      return fallback

    articles = resp.json().get("articles", [])
    headlines = []
    for a in articles:
      title = a.get("title") or ""
      desc = a.get("description") or ""
      if "[Removed]" in title: continue
      text = title
      if desc and text != desc:
        text += ". " + desc
      if text.strip():
        headlines.append({"text": text, "source": a.get("source", {}).get("name", "newsapi")})
    
    if not headlines:
      return fallback
    headlines = headlines[:20]

    tokenizer, model = _load_finbert()
    import torch

    texts = [h["text"] for h in headlines]
    inputs = tokenizer(texts, padding=True, truncation=True, max_length=128, return_tensors="pt")
    
    with torch.no_grad():
      outputs = model(**inputs)
      probs = torch.softmax(outputs.logits, dim=-1)
    
    items = []
    neg_scores = []
    pos_scores = []

    for i, h in enumerate(headlines):
      prob = probs[i]
      neg = float(prob[1])
      pos = float(prob[0])
      
      labels = ["positive", "negative", "neutral"]
      sentiment = labels[prob.argmax()]
      
      items.append({
        "headline": h["text"],
        "sentiment": sentiment,
        "score": neg,
        "source": h["source"]
      })
      neg_scores.append(neg)
      pos_scores.append(pos)
    
    items.sort(key=lambda x: x["score"], reverse=True)
    news_stress = ((np.mean(neg_scores) - np.mean(pos_scores) + 1) / 2) * 100
    news_stress = float(np.clip(news_stress, 0, 100))

    return {
      "stress_score": round(news_stress, 2),
      "items": items[:8]
    }

  except Exception as e:
    print(f"News fetch/finbert failed: {e}")
    return fallback

_cache = {
  "indicators":   {},
  "news":         {"stress_score": 50.0, "items": []},
  "last_updated": None,
  "update_count": 0
}


def refresh_cache() -> None:
  """
  Fetch fresh indicators + news. Update _cache.
  Called by APScheduler every 60 seconds.
  Also called once at startup.
  Never raises — catches all exceptions.
  Prints timestamp on each call.
  """
  global _cache
  try:
    print(f"[{datetime.now().strftime('%H:%M:%S')}] "
          f"Refreshing cache...")
    indicators = fetch_all_indicators()
    news       = fetch_news_sentiment()
    _cache["indicators"]   = indicators
    _cache["news"]         = news
    _cache["last_updated"] = datetime.now().isoformat()
    _cache["update_count"] += 1
    n_stressed = sum(
      1 for v in indicators.values()
      if v.get("is_stressed")
    )
    print(f"  ✅ Refreshed | "
          f"indicators={len(indicators)} | "
          f"stressed={n_stressed} | "
          f"news_stress={news['stress_score']:.1f}")
  except Exception as e:
    print(f"  ❌ Cache refresh failed: {e}")


def get_cache() -> dict:
  """Return current cache. Always returns something."""
  return _cache

