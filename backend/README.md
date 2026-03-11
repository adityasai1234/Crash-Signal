# CrashSignal Backend API

Real-time market stress detection.
Monitors 15 financial indicators + news sentiment.
Outputs stress score 0-100.

## Setup

cp .env.example .env
# Add FRED_API_KEY from fred.stlouisfed.org/docs/api
# Add NEWS_API_KEY from newsapi.org (free tier)

pip install -r requirements.txt

## Add Model Artifacts

Place these files in artifacts/:
  crashsignal_model.pth
  crashsignal_scaler.pkl
  model_config.json
  historical_stress.parquet
  variable_importance.csv
  today_analogs.json
  crisis_periods.json

## Run

python main.py
# or
uvicorn main:app --host 0.0.0.0 --port 8000

## API

| Endpoint      | Method | Description                    |
|---------------|--------|--------------------------------|
| /health       | GET    | Server status + uptime         |
| /live         | GET    | Current stress score           |
| /history      | GET    | 30yr historical stress scores  |
| /indicators   | GET    | All 15 indicator values        |
| /news         | GET    | Latest news sentiment          |
| /refresh      | POST   | Force data refresh             |
| /docs         | GET    | Interactive API explorer       |

## Stress Levels

| Score | Level    | Color   |
|-------|----------|---------|
| 0-25  | LOW      | #00d4aa |
| 26-50 | MODERATE | #4a9eff |
| 51-75 | ELEVATED | #ffd93d |
| 76-90 | HIGH     | #ff8c00 |
| 91-100| EXTREME  | #ff3333 |

## Docker

docker build -t crashsignal-api .
docker run -p 8000:8000 --env-file .env crashsignal-api
