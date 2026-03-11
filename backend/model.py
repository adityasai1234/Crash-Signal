import torch
import torch.nn as nn
from torch.nn import Linear, LayerNorm, Dropout, ELU, Identity, ModuleList, Sequential, ReLU, Sigmoid, LSTM, MultiheadAttention
import os
import json
import joblib
import numpy as np

class GRN(nn.Module):
    def __init__(self, in_d, hid_d, out_d, drop=0.5):
        super(GRN, self).__init__()
        self.fc1 = Linear(in_d, hid_d)
        self.fc2 = Linear(hid_d, out_d)
        self.gate = Linear(in_d, out_d)
        self.norm = LayerNorm(out_d)
        self.drop = Dropout(drop)
        self.elu = ELU()
        self.res = Linear(in_d, out_d) if in_d != out_d else Identity()

    def forward(self, x):
        r = self.res(x)
        h = self.drop(self.fc2(self.elu(self.fc1(x))))
        g = torch.sigmoid(self.gate(x))
        return self.norm(g * h + (1 - g) * r)

class VSN(nn.Module):
    def __init__(self, in_d, hid_d, drop=0.5):
        super(VSN, self).__init__()
        self.var_nns = ModuleList([
            Sequential(
                Linear(1, hid_d),
                ELU(),
                Dropout(drop),
                Linear(hid_d, hid_d)
            ) for _ in range(in_d)
        ])
        self.wnet = Sequential(
            Linear(in_d, hid_d),
            ELU(),
            Linear(hid_d, in_d),
            nn.Softmax(dim=-1)
        )
        self.proj = Linear(hid_d, hid_d)

    def forward(self, x):
        w = self.wnet(x.mean(dim=1))
        outs = [self.var_nns[i](x[:, :, i:i+1]) for i in range(len(self.var_nns))]
        stk = torch.stack(outs, dim=-1)
        sel = (stk * w.unsqueeze(1).unsqueeze(2)).sum(-1)
        return self.proj(sel), w

class CrashSignalTFT(nn.Module):
    def __init__(self, input_dim, hidden_dim=64, lstm_layers=1, num_heads=4, num_classes=3, dropout=0.5):
        super(CrashSignalTFT, self).__init__()
        H = hidden_dim
        self.vsn = VSN(input_dim, H, dropout)
        self.lstm = LSTM(H, H, lstm_layers, batch_first=True)
        self.grn1 = GRN(H, H, H, dropout)
        self.attn = MultiheadAttention(H, num_heads, dropout=dropout, batch_first=True)
        self.grn2 = GRN(H, H, H, dropout)
        self.norm = LayerNorm(H)
        self.clf = Sequential(
            Linear(H, H // 2), 
            ReLU(),
            Dropout(dropout),
            Linear(H // 2, num_classes)
        )
        self.stress = Sequential(
            Linear(H, 32), 
            ReLU(),
            Linear(32, 1), 
            Sigmoid()
        )

    def forward(self, x):
        x, w = self.vsn(x)
        x, _ = self.lstm(x)
        x = self.grn1(x)
        x2, _ = self.attn(x, x, x)
        x = self.grn2(x2 + x)
        x = self.norm(x)
        f = x[:, -1, :]
        return self.clf(f), self.stress(f) * 100, w

class CrashSignalModel:
    def __init__(self):
        self.model = None
        self.scaler = None
        self.config = None
        self.feature_cols = None
        self.window_size = None
        self.loaded = False
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

    def load(self, artifacts_dir="artifacts"):
        config_path = os.path.join(artifacts_dir, "model_config.json")
        model_path = os.path.join(artifacts_dir, "crashsignal_model.pth")
        scaler_path = os.path.join(artifacts_dir, "crashsignal_scaler.pkl")

        for path in [config_path, model_path, scaler_path]:
            if not os.path.exists(path):
                raise FileNotFoundError(f"Missing artifact: {path}")

        with open(config_path, 'r') as f:
            self.config = json.load(f)

        self.feature_cols = self.config["feature_cols"]
        self.window_size = self.config["window_size"]

        self.model = CrashSignalTFT(
            input_dim=self.config["input_dim"],
            hidden_dim=self.config["hidden_dim"],
            lstm_layers=self.config["lstm_layers"],
            num_heads=self.config["num_heads"],
            num_classes=self.config["num_classes"],
            dropout=self.config["dropout"]
        )
        self.model.load_state_dict(torch.load(model_path, map_location=self.device))
        self.model.to(self.device)
        self.model.eval()

        self.scaler = joblib.load(scaler_path)
        self.loaded = True

        n_params = sum(p.numel() for p in self.model.parameters())
        print(f"✅ Model loaded | device={self.device} | params={n_params:,}")

    def predict(self, window: np.ndarray) -> dict:
        if not self.loaded:
            raise RuntimeError("Model is not loaded")

        scaled = self.scaler.transform(window)
        tensor = torch.tensor(scaled[np.newaxis, :, :], dtype=torch.float32).to(self.device)

        with torch.no_grad():
            lg, st, wt = self.model(tensor)
            probs = torch.softmax(lg, dim=-1)

        return {
            "stress_score": float(st.squeeze().cpu()),
            "label": int(lg.argmax(1).cpu()),
            "probabilities": probs.cpu().numpy()[0].tolist()
        }

ml_model = CrashSignalModel()
