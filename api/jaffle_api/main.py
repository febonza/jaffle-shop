"""FastAPI entry point. Run with: `uv run uvicorn jaffle_api.main:app --reload`."""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from jaffle_api.routes import overview

app = FastAPI(
    title="Jaffle Shop API",
    description="Read-only API serving Jaffle Shop analytics marts.",
    version="0.1.0",
)

# CORS is permissive in local dev (Vite on :5173 fetching from :8000).
# In prod, Caddy reverse-proxies /api/* to FastAPI on the same origin so
# this middleware is effectively a no-op.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5174", "http://127.0.0.1:5174"],
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {"status": "ok"}


app.include_router(overview.router, prefix="/api")
