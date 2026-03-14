FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first (layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Generate dummy artifacts
RUN mkdir -p artifacts && \
    python3 << 'INNER_EOF'
import json
import torch
import joblib
import pandas as pd
import numpy as np
from model import CrashSignalTFT

# 1. Create model_config.json
config = {
    'input_dim': 43,
    'hidden_dim': 64,
    'lstm_layers': 1,
    'num_heads': 4,
    'num_classes': 3,
    'dropout': 0.5,
    'window_size': 60,
    'feature_cols': ['vix', 'ted_spread', 'yield_curve', 'credit_spread_hy', 'credit_spread_ig', 'financial_conditions', 'bank_stress', 'unemployment_claims', 'consumer_sentiment', 'manufacturing_pmi', 'real_rates', 'dollar_index', 'gold_ratio', 'vvix', 'sp500', 'vix_zscore', 'ted_spread_zscore', 'yield_curve_zscore', 'credit_spread_hy_zscore', 'credit_spread_ig_zscore', 'financial_conditions_zscore', 'bank_stress_zscore', 'unemployment_claims_zscore', 'consumer_sentiment_zscore', 'manufacturing_pmi_zscore', 'real_rates_zscore', 'dollar_index_zscore', 'gold_ratio_zscore', 'vvix_zscore', 'sp500_zscore', 'vix_roc5', 'credit_spread_hy_roc5', 'yield_curve_roc5', 'sp500_roc5', 'sp500_drawdown', 'vix_regime', 'vix_extreme', 'inversion_duration', 'credit_spread_velocity']
}
with open('artifacts/model_config.json', 'w') as f:
    json.dump(config, f, indent=2)

# 2. Create a dummy scaler and save it
from sklearn.preprocessing import StandardScaler
scaler = StandardScaler()
dummy_data = np.random.randn(100, 43)
scaler.fit(dummy_data)
joblib.dump(scaler, 'artifacts/crashsignal_scaler.pkl')

# 3. Create and save a dummy model
model = CrashSignalTFT(
    input_dim=config['input_dim'],
    hidden_dim=config['hidden_dim'],
    lstm_layers=config['lstm_layers'],
    num_heads=config['num_heads'],
    num_classes=config['num_classes'],
    dropout=config['dropout']
)
torch.save(model.state_dict(), 'artifacts/crashsignal_model.pth')

# 4. Create dummy historical_stress.parquet
dates = pd.date_range(end=pd.Timestamp.today(), periods=365*30, freq='D')
stress_scores = np.random.rand(len(dates)) * 100
df = pd.DataFrame({'date': dates, 'stress_score': stress_scores})
df.to_parquet('artifacts/historical_stress.parquet', index=False)
INNER_EOF

EXPOSE 8000

CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
