"""Secondary ratings (Letterboxd, Metacritic). Phase 2 will scrape/fetch these;
for the MVP they are optional and return None so the composite simply weights IMDb.
Every rating source is optional (non-negotiable rule 4)."""
from __future__ import annotations


async def fetch_letterboxd(title: str, year: int | None) -> float | None:
    return None


async def fetch_metacritic(title: str, year: int | None) -> int | None:
    return None
