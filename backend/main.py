from contextlib import asynccontextmanager
from datetime import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from schemas import HealthResponse

startup_time = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global startup_time
    startup_time = datetime.now()
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
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", response_model=HealthResponse)
def health():
    now = datetime.now()
    uptime_seconds = (now - startup_time).total_seconds() if startup_time else 0.0
    return HealthResponse(
        status="ok",
        model_loaded=False,
        last_updated="never",
        uptime_seconds=uptime_seconds,
        refresh_count=0
    )
