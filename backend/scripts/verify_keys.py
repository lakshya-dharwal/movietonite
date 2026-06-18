"""Throwaway key-verification script (Sprint 0, S0-3). Does one live TMDb search
and one small Claude call to confirm credentials work. Reads from the git-ignored
.env. Run from the backend dir: `python scripts/verify_keys.py`."""
from __future__ import annotations

import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import httpx  # noqa: E402

from clients import claude  # noqa: E402
from config import settings  # noqa: E402
from models import UserPreferences  # noqa: E402


async def check_tmdb() -> None:
    if not settings.has_tmdb:
        print("✗ TMDB_API_KEY missing — skipping TMDb check")
        return
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            "https://api.themoviedb.org/3/search/movie",
            params={"api_key": settings.tmdb_api_key, "query": "Prisoners", "year": 2013},
            timeout=10.0,
        )
        resp.raise_for_status()
        results = resp.json().get("results", [])
        if results:
            top = results[0]
            print(f"✓ TMDb OK — '{top.get('title')}' ({top.get('release_date', '')[:4]}), "
                  f"vote_average={top.get('vote_average')}")
        else:
            print("✗ TMDb returned no results (key may be invalid)")


async def check_claude() -> None:
    if not settings.has_anthropic:
        print("✗ ANTHROPIC_API_KEY missing — skipping Claude check")
        return
    prefs = UserPreferences(
        mood="dark", time="2h+", media_type="movie", genres=["thriller"],
        recent_loves=["Prisoners"],
    )
    titles = (await claude.select_titles(prefs))["titles"]
    if titles:
        names = ", ".join(t["title"] for t in titles[:3])
        print(f"✓ Claude OK — suggested {len(titles)} titles (e.g. {names})")
    else:
        print("✗ Claude returned no titles (key may be invalid or response unparseable)")


async def main() -> None:
    print(f"Model: {settings.anthropic_model}\n")
    await check_tmdb()
    await check_claude()


if __name__ == "__main__":
    asyncio.run(main())
