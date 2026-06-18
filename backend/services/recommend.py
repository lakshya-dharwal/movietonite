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


def _decade_ranges(decades: list[str]) -> list[tuple[int, int]]:
    """Map decade labels like '1990s'/'90s'/'2000s' to (start, end) year ranges."""
    ranges: list[tuple[int, int]] = []
    for d in decades:
        digits = "".join(c for c in d if c.isdigit())
        if not digits:
            continue
        n = int(digits)
        if n < 100:  # '90s' / '00s' shorthand
            n = 1900 + n if n >= 30 else 2000 + n
        start = (n // 10) * 10
        ranges.append((start, start + 9))
    return ranges


def _in_decades(year: int, ranges: list[tuple[int, int]]) -> bool:
    return any(start <= year <= end for start, end in ranges)


async def _build_one(
    client: httpx.AsyncClient,
    prefs: UserPreferences,
    candidate: dict,
    region: str,
    decade_ranges: list[tuple[int, int]],
) -> Recommendation | None:
    """Enrich one candidate via TMDb, score it, and generate conviction text.
    Returns None if TMDb can't resolve the title or it falls outside chosen decades."""
    enriched = await tmdb.enrich(
        client, candidate["title"], candidate.get("year"), candidate.get("media_type", "movie"), region
    )
    if enriched is None or not enriched.get("imdb_rating"):
        return None
    # Decade filter: drop titles outside the user's chosen decades.
    if decade_ranges and not _in_decades(enriched.get("year", 0), decade_ranges):
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


async def recommend(prefs: UserPreferences) -> tuple[list[Recommendation], str]:
    """Full pipeline. Returns (ranked picks, mood_read). 3-5 picks, best composite
    first, none below floor, none repeating prefs.exclude_titles, all within decades."""
    selection = await claude.select_titles(prefs)
    candidates = selection["titles"]
    mood_read = selection["mood_read"]
    if not candidates:
        logger.info("No candidates from Claude (missing key or empty response).")
        return [], mood_read

    region = _region_for(prefs)
    decade_ranges = _decade_ranges(prefs.decades)
    excluded = {t.strip().lower() for t in prefs.exclude_titles}

    async with httpx.AsyncClient() as client:
        built = await asyncio.gather(
            *(_build_one(client, prefs, c, region, decade_ranges) for c in candidates),
            return_exceptions=True,
        )

    recs: list[Recommendation] = []
    for item in built:
        if isinstance(item, Recommendation):
            if item.title.strip().lower() in excluded:
                continue  # belt-and-suspenders: never repeat an already-shown title
            recs.append(item)
        elif isinstance(item, Exception):
            logger.warning("Candidate enrichment errored: %s", item)

    ranked = scoring.rank(recs, prefs)
    return ranked[:MAX_RESULTS], mood_read
