"""Pydantic models — the binding contract between frontend and backend.
Mirrors planning-docs/04_API-Specification.md §3. Optional rating fields are
typed as `| None` and default to None so missing data never breaks a response."""
from __future__ import annotations

from pydantic import BaseModel, Field


class UserPreferences(BaseModel):
    mood: str                       # chill | energetic | emotional | dark | funny | surprise
    time: str                       # 20-30m | 1h | 2h+ | any
    media_type: str                 # movie | show | either
    genres: list[str] = Field(default_factory=list, max_length=3)
    subgenres: list[str] = Field(default_factory=list)
    pacing: str = "any"             # slow | fast | any
    origin: str = "any"             # global | indian | both | any
    indian_langs: list[str] = Field(default_factory=list)
    decades: list[str] = Field(default_factory=list)   # 1990s | 2000s | 2010s | 2020s
    recent_loves: list[str] = Field(default_factory=list)
    exclude_titles: list[str] = Field(default_factory=list)  # already-shown titles to skip (refresh)
    min_rating: float = 7.5
    sort_by: str = "composite"      # composite | imdb | votes | newest | runtime | letterboxd


class Recommendation(BaseModel):
    title: str
    year: int
    tmdb_id: int
    media_type: str
    composite_score: float
    rating_badge: str
    imdb_rating: float
    imdb_votes: int
    letterboxd_rating: float | None = None
    metacritic_score: int | None = None
    synopsis: str
    convince_you: str = ""
    why_youll_love_it: str = ""
    genres: list[str] = Field(default_factory=list)
    subgenres: list[str] = Field(default_factory=list)
    pacing: str = "any"
    runtime_min: int = 0
    language: str = ""
    director: str = ""
    cast: list[str] = Field(default_factory=list)
    streaming_on: list[str] = Field(default_factory=list)
    rent_buy_on: list[str] = Field(default_factory=list)
    poster_url: str | None = None


class RecommendResponse(BaseModel):
    results: list[Recommendation] = Field(default_factory=list)
    mood_read: str = ""   # Claude's read on the user's mood + why this set fits


class MovieDetail(BaseModel):
    tmdb_id: int
    title: str
    year: int
    media_type: str
    full_synopsis: str = ""
    director: str = ""
    cast: list[str] = Field(default_factory=list)
    runtime_min: int = 0
    genres: list[str] = Field(default_factory=list)
    language: str = ""
    budget: int | None = None
    imdb_rating: float | None = None
    letterboxd_rating: float | None = None
    metacritic_score: int | None = None
    streaming_on: list[str] = Field(default_factory=list)
    rent_buy_on: list[str] = Field(default_factory=list)
    poster_url: str | None = None
    backdrop_url: str | None = None
