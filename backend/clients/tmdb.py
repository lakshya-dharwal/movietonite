"""TMDb client: search a title, fetch full detail (genres, runtime, cast, director,
language, vote_average as the IMDb-proxy rating for the MVP, poster), and watch
providers (region-aware). All calls are async, timed out, and cached. TMDb failure
for one candidate drops that candidate rather than crashing the request."""
from __future__ import annotations

import logging

import httpx

from cache import cache
from clients.providers import split_providers
from config import settings

logger = logging.getLogger(__name__)

BASE_URL = "https://api.themoviedb.org/3"
IMAGE_BASE = "https://image.tmdb.org/t/p/w500"
BACKDROP_BASE = "https://image.tmdb.org/t/p/w1280"
_TIMEOUT = httpx.Timeout(8.0)


def _params(extra: dict | None = None) -> dict:
    p = {"api_key": settings.tmdb_api_key}
    if extra:
        p.update(extra)
    return p


def _poster_url(path: str | None) -> str | None:
    return f"{IMAGE_BASE}{path}" if path else None


async def _get(client: httpx.AsyncClient, path: str, params: dict | None = None) -> dict | None:
    try:
        resp = await client.get(f"{BASE_URL}{path}", params=_params(params), timeout=_TIMEOUT)
        resp.raise_for_status()
        return resp.json()
    except Exception as exc:  # noqa: BLE001
        logger.warning("TMDb GET %s failed: %s", path, exc)
        return None


async def search(client: httpx.AsyncClient, title: str, year: int | None, media_type: str) -> dict | None:
    """Search for the best matching movie or show. Returns the top TMDb result dict."""
    is_show = media_type == "show"
    endpoint = "/search/tv" if is_show else "/search/movie"
    params: dict = {"query": title, "include_adult": "false"}
    if year:
        params["year" if not is_show else "first_air_date_year"] = year
    data = await _get(client, endpoint, params)
    if not data or not data.get("results"):
        return None
    top = data["results"][0]
    top["_media_type"] = "show" if is_show else "movie"
    return top


async def _details_region(region: str) -> str:
    return region


async def enrich(
    client: httpx.AsyncClient, title: str, year: int | None, media_type: str, region: str = "US"
) -> dict | None:
    """Search + fetch detail + providers, returning a flat dict of enrichment fields,
    or None if the title can't be resolved on TMDb."""
    cache_key = f"tmdb:enrich:{media_type}:{title}:{year}:{region}"
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    hit = await search(client, title, year, media_type)
    if hit is None:
        return None

    resolved_type = hit["_media_type"]
    tmdb_id = hit["id"]
    detail_path = f"/{'tv' if resolved_type == 'show' else 'movie'}/{tmdb_id}"
    detail = await _get(
        client, detail_path, {"append_to_response": "credits,watch/providers"}
    )
    if detail is None:
        return None

    # Title / year differ by media type.
    if resolved_type == "show":
        name = detail.get("name") or title
        date = detail.get("first_air_date") or ""
        runtime_list = detail.get("episode_run_time") or []
        runtime = int(runtime_list[0]) if runtime_list else 0
    else:
        name = detail.get("title") or title
        date = detail.get("release_date") or ""
        runtime = int(detail.get("runtime") or 0)

    parsed_year = int(date[:4]) if date[:4].isdigit() else (year or 0)
    genres = [g["name"] for g in detail.get("genres", []) if g.get("name")]
    language = detail.get("original_language", "") or ""

    credits = detail.get("credits", {}) or {}
    cast = [c["name"] for c in (credits.get("cast") or [])[:5] if c.get("name")]
    director = ""
    for crew in credits.get("crew", []) or []:
        if crew.get("job") == "Director":
            director = crew.get("name", "")
            break
    if not director and resolved_type == "show":
        creators = detail.get("created_by") or []
        if creators:
            director = creators[0].get("name", "")

    providers_root = (detail.get("watch/providers") or {}).get("results", {})
    region_block = providers_root.get(region) or providers_root.get("US") or {}
    streaming_on, rent_buy_on = split_providers(region_block)

    result = {
        "tmdb_id": tmdb_id,
        "media_type": resolved_type,
        "title": name,
        "year": parsed_year,
        "synopsis": detail.get("overview", "") or "",
        "imdb_rating": float(detail.get("vote_average") or 0.0),
        "imdb_votes": int(detail.get("vote_count") or 0),
        "genres": genres,
        "runtime_min": runtime,
        "language": language,
        "director": director,
        "cast": cast,
        "streaming_on": streaming_on,
        "rent_buy_on": rent_buy_on,
        "poster_url": _poster_url(detail.get("poster_path")),
        "backdrop_url": (f"{BACKDROP_BASE}{detail['backdrop_path']}" if detail.get("backdrop_path") else None),
        "budget": detail.get("budget"),
    }
    cache.set(cache_key, result)
    return result


async def fetch_detail(tmdb_id: int, media_type: str = "movie", region: str = "US") -> dict | None:
    """Fetch full detail for the detail modal (GET /movie/{tmdb_id})."""
    async with httpx.AsyncClient() as client:
        detail = await _get(
            client,
            f"/{'tv' if media_type == 'show' else 'movie'}/{tmdb_id}",
            {"append_to_response": "credits,watch/providers"},
        )
    return detail
