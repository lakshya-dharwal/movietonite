"""FastAPI app: /health, POST /recommend, GET /movie/{tmdb_id}.
CORS is restricted to ALLOWED_ORIGIN. Errors use the consistent envelope from
planning-docs/04 §6. Backend validation (Pydantic) is the security boundary."""
from __future__ import annotations

import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from clients import tmdb
from clients.providers import split_providers
from config import settings
from models import MovieDetail, RecommendResponse, UserPreferences
from services.recommend import recommend

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("wsiwt")

app = FastAPI(title="What Should I Watch Tonight? API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _error(status: int, code: str, message: str, detail=None) -> JSONResponse:
    return JSONResponse(
        status_code=status,
        content={"error": {"code": code, "message": message, "detail": detail}},
    )


@app.exception_handler(RequestValidationError)
async def validation_handler(_: Request, exc: RequestValidationError) -> JSONResponse:
    return _error(422, "VALIDATION_ERROR", "Request validation failed.", exc.errors())


@app.exception_handler(Exception)
async def unhandled_handler(_: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled error: %s", exc)
    return _error(500, "INTERNAL_ERROR", "An unexpected error occurred.")


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}


@app.post("/recommend", response_model=RecommendResponse)
async def recommend_route(prefs: UserPreferences) -> RecommendResponse:
    results = await recommend(prefs)
    return RecommendResponse(results=results)


@app.get("/movie/{tmdb_id}", response_model=MovieDetail)
async def movie_route(tmdb_id: int, media_type: str = "movie", region: str = "US"):
    detail = await tmdb.fetch_detail(tmdb_id, media_type, region)
    if detail is None:
        return _error(502, "UPSTREAM_FAILURE", "Could not load movie detail.")

    is_show = media_type == "show"
    if is_show:
        title = detail.get("name", "")
        date = detail.get("first_air_date", "") or ""
        runtimes = detail.get("episode_run_time") or []
        runtime = int(runtimes[0]) if runtimes else 0
    else:
        title = detail.get("title", "")
        date = detail.get("release_date", "") or ""
        runtime = int(detail.get("runtime") or 0)

    credits = detail.get("credits", {}) or {}
    cast = [c["name"] for c in (credits.get("cast") or [])[:8] if c.get("name")]
    director = next(
        (c.get("name", "") for c in (credits.get("crew") or []) if c.get("job") == "Director"), ""
    )
    providers_root = (detail.get("watch/providers") or {}).get("results", {})
    region_block = providers_root.get(region) or providers_root.get("US") or {}
    streaming_on, rent_buy_on = split_providers(region_block)

    return MovieDetail(
        tmdb_id=tmdb_id,
        title=title,
        year=int(date[:4]) if date[:4].isdigit() else 0,
        media_type=media_type,
        full_synopsis=detail.get("overview", "") or "",
        director=director,
        cast=cast,
        runtime_min=runtime,
        genres=[g["name"] for g in detail.get("genres", []) if g.get("name")],
        language=detail.get("original_language", "") or "",
        budget=detail.get("budget"),
        imdb_rating=float(detail["vote_average"]) if detail.get("vote_average") else None,
        streaming_on=streaming_on,
        rent_buy_on=rent_buy_on,
        poster_url=(f"{tmdb.IMAGE_BASE}{detail['poster_path']}" if detail.get("poster_path") else None),
        backdrop_url=(f"{tmdb.BACKDROP_BASE}{detail['backdrop_path']}" if detail.get("backdrop_path") else None),
    )
