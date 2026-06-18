"""Recommendation orchestration (planning-docs/03 §1, §5):
  Claude -> candidate titles
  -> async parallel TMDb enrichment + conviction text
  -> composite score + badge
  -> quality floor + rating-first sort
  -> top 5.
All third-party calls degrade gracefully; partial failure never breaks the response."""
from __future__ import annotations

import asyncio
import logging

import httpx

from clients import claude, tmdb
from clients.ratings import fetch_letterboxd, fetch_metacritic
from models import Recommendation, UserPreferences
from services import scoring

logger = logging.getLogger(__name__)

MAX_RESULTS = 5


def _region_for(prefs: UserPreferences) -> str:
    return "IN" if prefs.origin in ("indian", "both") else "US"


async def _build_one(
    client: httpx.AsyncClient, prefs: UserPreferences, candidate: dict, region: str
) -> Recommendation | None:
    """Enrich one candidate via TMDb, score it, and generate conviction text.
    Returns None if TMDb can't resolve the title."""
    enriched = await tmdb.enrich(
        client, candidate["title"], candidate.get("year"), candidate.get("media_type", "movie"), region
    )
    if enriched is None or not enriched.get("imdb_rating"):
        return None

    # Secondary ratings (optional; None in the MVP).
    letterboxd, metacritic = await asyncio.gather(
        fetch_letterboxd(enriched["title"], enriched["year"]),
        fetch_metacritic(enriched["title"], enriched["year"]),
    )

    composite = scoring.composite_score(enriched["imdb_rating"], letterboxd, metacritic)

    conviction = await claude.write_conviction(prefs, enriched)

    return Recommendation(
        title=enriched["title"],
        year=enriched["year"],
        tmdb_id=enriched["tmdb_id"],
        media_type=enriched["media_type"],
        composite_score=round(composite, 2),
        rating_badge=scoring.badge(enriched["imdb_rating"]),
        imdb_rating=round(enriched["imdb_rating"], 1),
        imdb_votes=enriched["imdb_votes"],
        letterboxd_rating=letterboxd,
        metacritic_score=metacritic,
        synopsis=enriched["synopsis"],
        convince_you=conviction["convince_you"],
        why_youll_love_it=conviction["why_youll_love_it"],
        genres=enriched["genres"],
        subgenres=prefs.subgenres,
        pacing=prefs.pacing,
        runtime_min=enriched["runtime_min"],
        language=enriched["language"],
        director=enriched["director"],
        cast=enriched["cast"],
        streaming_on=enriched["streaming_on"],
        rent_buy_on=enriched["rent_buy_on"],
        poster_url=enriched["poster_url"],
    )


async def recommend(prefs: UserPreferences) -> list[Recommendation]:
    """Full pipeline. Returns 3-5 ranked picks, best composite first, none below floor."""
    candidates = await claude.select_titles(prefs)
    if not candidates:
        logger.info("No candidates from Claude (missing key or empty response).")
        return []

    region = _region_for(prefs)
    async with httpx.AsyncClient() as client:
        built = await asyncio.gather(
            *(_build_one(client, prefs, c, region) for c in candidates),
            return_exceptions=True,
        )

    recs: list[Recommendation] = []
    for item in built:
        if isinstance(item, Recommendation):
            recs.append(item)
        elif isinstance(item, Exception):
            logger.warning("Candidate enrichment errored: %s", item)

    ranked = scoring.rank(recs, prefs)
    return ranked[:MAX_RESULTS]
