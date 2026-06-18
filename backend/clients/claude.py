"""Anthropic Claude client. Two prompts: title selection and conviction text.
Claude must return JSON only; we parse defensively so a bad model response never
crashes a request (non-negotiable rule 3). Uses the async SDK."""
from __future__ import annotations

import json
import logging

from anthropic import AsyncAnthropic

from config import settings
from models import UserPreferences

logger = logging.getLogger(__name__)

_client: AsyncAnthropic | None = None


def _get_client() -> AsyncAnthropic | None:
    global _client
    if not settings.has_anthropic:
        return None
    if _client is None:
        _client = AsyncAnthropic(api_key=settings.anthropic_api_key)
    return _client


def _strip_json(text: str) -> str:
    """Strip markdown fences and surrounding prose, returning the JSON payload."""
    t = text.strip()
    if t.startswith("```"):
        # remove leading ```json / ``` and trailing ```
        t = t.split("\n", 1)[1] if "\n" in t else t
        if t.endswith("```"):
            t = t[: -3]
    t = t.strip()
    # If there is leading/trailing prose, grab the outermost JSON bracket span.
    for open_c, close_c in (("[", "]"), ("{", "}")):
        start = t.find(open_c)
        end = t.rfind(close_c)
        if start != -1 and end != -1 and end > start:
            return t[start : end + 1]
    return t


def _build_selection_prompt(prefs: UserPreferences) -> str:
    parts = [
        f"mood: {prefs.mood}",
        f"available_time: {prefs.time}",
        f"media_type: {prefs.media_type}",
        f"genres: {', '.join(prefs.genres) or 'any'}",
    ]
    if prefs.subgenres:
        parts.append(f"subgenres: {', '.join(prefs.subgenres)}")
    if prefs.pacing and prefs.pacing != "any":
        parts.append(f"pacing: {prefs.pacing}")
    if prefs.origin and prefs.origin != "any":
        parts.append(f"origin: {prefs.origin}")
    if prefs.indian_langs:
        parts.append(f"indian_languages: {', '.join(prefs.indian_langs)}")
    if prefs.recent_loves:
        parts.append(f"recently_loved: {', '.join(prefs.recent_loves)}")
    return "\n".join(parts)


SELECTION_SYSTEM = (
    "You are a film & TV curator for a rating-first recommendation app. "
    "Given a user's preferences, propose 6-8 real, well-rated, critically respected "
    "titles that match their mood, genres, sub-genres, pacing, and origin. Strongly "
    "bias toward titles with high IMDb ratings (7.5+). Favor a mix of well-known and "
    "deeper cuts. If origin is 'indian' or 'both', include strong Indian-cinema picks.\n\n"
    "Return JSON ONLY — no prose, no markdown fences. The JSON must be an array of "
    'objects: [{"title": str, "year": int, "media_type": "movie"|"show"}]. '
    "Use the exact widely-known title and original release year so it can be looked up."
)

CONVICTION_SYSTEM = (
    "You write for a rating-first movie app. For ONE title, given its ratings and the "
    "user's taste, write two short persuasive paragraphs. Return JSON ONLY (no fences): "
    '{"convince_you": str, "why_youll_love_it": str}. '
    '"convince_you": lead with rating credibility and justify the time cost (2-3 sentences). '
    '"why_youll_love_it": tie the pick to the user\'s mood and the titles they recently loved '
    "(2-3 sentences). Be specific and concrete; never invent ratings."
)


async def select_titles(prefs: UserPreferences) -> list[dict]:
    """Ask Claude for candidate titles. Returns [] on any failure (never raises)."""
    client = _get_client()
    if client is None:
        return []
    try:
        resp = await client.messages.create(
            model=settings.anthropic_model,
            max_tokens=2000,
            thinking={"type": "adaptive"},
            system=SELECTION_SYSTEM,
            messages=[{"role": "user", "content": _build_selection_prompt(prefs)}],
        )
        text = next((b.text for b in resp.content if b.type == "text"), "")
        data = json.loads(_strip_json(text))
        if not isinstance(data, list):
            return []
        out: list[dict] = []
        for item in data:
            if isinstance(item, dict) and item.get("title"):
                out.append(
                    {
                        "title": str(item["title"]),
                        "year": int(item["year"]) if str(item.get("year", "")).isdigit() else None,
                        "media_type": item.get("media_type", "movie"),
                    }
                )
        return out
    except Exception as exc:  # noqa: BLE001 — defensive: bad model output must not crash
        logger.warning("Claude title selection failed: %s", exc)
        return []


async def write_conviction(prefs: UserPreferences, rec_summary: dict) -> dict:
    """Generate convince_you + why_youll_love_it for one title. Returns empty
    strings on any failure so the card still renders (rule 4)."""
    client = _get_client()
    if client is None:
        return {"convince_you": "", "why_youll_love_it": ""}
    user_payload = {
        "title": rec_summary.get("title"),
        "year": rec_summary.get("year"),
        "imdb_rating": rec_summary.get("imdb_rating"),
        "imdb_votes": rec_summary.get("imdb_votes"),
        "genres": rec_summary.get("genres"),
        "runtime_min": rec_summary.get("runtime_min"),
        "user_mood": prefs.mood,
        "recent_loves": prefs.recent_loves,
        "pacing": prefs.pacing,
    }
    try:
        resp = await client.messages.create(
            model=settings.anthropic_model,
            max_tokens=600,
            system=CONVICTION_SYSTEM,
            messages=[{"role": "user", "content": json.dumps(user_payload)}],
        )
        text = next((b.text for b in resp.content if b.type == "text"), "")
        data = json.loads(_strip_json(text))
        if isinstance(data, dict):
            return {
                "convince_you": str(data.get("convince_you", "")),
                "why_youll_love_it": str(data.get("why_youll_love_it", "")),
            }
    except Exception as exc:  # noqa: BLE001
        logger.warning("Claude conviction failed for %s: %s", rec_summary.get("title"), exc)
    return {"convince_you": "", "why_youll_love_it": ""}
