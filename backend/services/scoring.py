"""Core scoring logic — the product's whole point (planning-docs/03 §5).
Pure functions: composite_score, badge, quality-floor filter, and sort.
Rating-first sorting + the floor are non-negotiable (rule 1)."""
from __future__ import annotations

from models import Recommendation, UserPreferences


def composite_score(
    imdb: float,
    letterboxd: float | None = None,
    metacritic: int | None = None,
) -> float:
    """Normalize all sources to /10, weight IMDb heaviest, renormalize over the
    sources that are actually present. Missing sources are simply excluded."""
    lb_10 = (letterboxd * 2) if letterboxd is not None else None
    meta_10 = (metacritic / 10) if metacritic is not None else None

    parts: list[float] = [imdb]
    weights: list[float] = [0.5]
    if lb_10 is not None:
        parts.append(lb_10)
        weights.append(0.3)
    if meta_10 is not None:
        parts.append(meta_10)
        weights.append(0.2)

    return sum(p * w for p, w in zip(parts, weights)) / sum(weights)


def badge(imdb: float) -> str:
    if imdb >= 9.0:
        return "MASTERPIECE"
    if imdb >= 8.0:
        return "CRITICALLY ACCLAIMED"
    if imdb >= 7.0:
        return "HIGHLY RATED"
    if imdb >= 6.0:
        return "GOOD"
    return "PASS"


def apply_floor(recs: list[Recommendation], min_rating: float) -> list[Recommendation]:
    """Drop any title below the quality floor. No mediocre picks."""
    return [r for r in recs if r.imdb_rating >= min_rating]


def _sort_key(sort_by: str):
    if sort_by == "imdb":
        return lambda r: (-r.imdb_rating, -r.imdb_votes)
    if sort_by == "votes":
        return lambda r: (-r.imdb_votes, -r.composite_score)
    if sort_by == "newest":
        return lambda r: (-r.year, -r.composite_score)
    if sort_by == "runtime":
        return lambda r: (r.runtime_min, -r.composite_score)
    if sort_by == "letterboxd":
        return lambda r: (-(r.letterboxd_rating or 0.0), -r.composite_score)
    # default: composite, votes tie-break
    return lambda r: (-r.composite_score, -r.imdb_votes)


def sort_recs(recs: list[Recommendation], sort_by: str = "composite") -> list[Recommendation]:
    return sorted(recs, key=_sort_key(sort_by))


def rank(recs: list[Recommendation], prefs: UserPreferences) -> list[Recommendation]:
    """Apply the floor, then sort best-first. Used by the orchestrator and tests."""
    floored = apply_floor(recs, prefs.min_rating)
    return sort_recs(floored, prefs.sort_by)
