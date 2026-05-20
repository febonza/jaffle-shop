"""FastAPI entry point. Run with: `uv run uvicorn jaffle_api.main:app --reload`."""

from __future__ import annotations

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from jaffle_api.routes import app as app_routes

_default_origins = "http://localhost:5174,http://127.0.0.1:5174"
CORS_ORIGINS = [o.strip() for o in os.getenv("CORS_ORIGINS", _default_origins).split(",") if o.strip()]

app = FastAPI(
    title="Jaffle Shop API",
    description="Read-only API serving Jaffle Shop analytics marts.",
    version="0.2.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {"status": "ok"}


app.include_router(app_routes.router, prefix="/api")
