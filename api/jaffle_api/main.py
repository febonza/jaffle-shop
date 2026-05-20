"""FastAPI entry point. Run with: `uv run uvicorn jaffle_api.main:app --reload`."""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from jaffle_api.routes import app as app_routes

app = FastAPI(
    title="Jaffle Shop API",
    description="Read-only API serving Jaffle Shop analytics marts.",
    version="0.2.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5174", "http://127.0.0.1:5174"],
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {"status": "ok"}


app.include_router(app_routes.router, prefix="/api")
