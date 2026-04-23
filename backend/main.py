import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
from dotenv import load_dotenv

load_dotenv()

from routers import pricing, calculator, history
from services.pricing_service import PricingService
from services.db_service import DatabaseService


@asynccontextmanager
async def lifespan(app: FastAPI):
    db = DatabaseService()
    await db.init()
    app.state.db = db
    app.state.pricing = PricingService()
    yield
    await db.close()


app = FastAPI(
    title="LLM Cost Calculator API",
    description="Professional API for calculating and comparing LLM costs across providers",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS: permite a URL do frontend (Vercel em prod, localhost em dev)
_raw_origins = os.getenv("FRONTEND_URL", "http://localhost:3001")
ALLOWED_ORIGINS = [o.strip() for o in _raw_origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(pricing.router, prefix="/api/pricing", tags=["Pricing"])
app.include_router(calculator.router, prefix="/api/calculator", tags=["Calculator"])
app.include_router(history.router, prefix="/api/history", tags=["History"])


@app.get("/")
async def root():
    return {"status": "online", "version": "1.0.0", "service": "LLM Cost Calculator"}


@app.get("/health")
async def health():
    return {"status": "healthy"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", 8000)), reload=True)
