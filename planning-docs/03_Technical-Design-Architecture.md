# Technical Design & Architecture Document (TDD)
## "What Should I Watch Tonight?"

| Field | Value |
|---|---|
| Document | Technical Design & Architecture |
| Product | What Should I Watch Tonight? (WSIWT) |
| Owner | Lakshya Dharwal |
| Version | v1.0 |
| Status | Draft |
| Date | June 17, 2026 |
| Related docs | PRD, SRS, API Spec, UX Spec, Master SOP |

---

## 1. Architectural Overview

WSIWT is a two-tier web application: a React single-page frontend and a FastAPI backend that orchestrates the Claude API, TMDb, multi-source ratings, and streaming-provider lookups. The backend is the only component that holds secrets and talks to third parties; the frontend is a pure consumer of the backend's REST API.

```
[ React + TypeScript SPA ]
        │  POST /recommend { preferences }
        ▼
[ FastAPI Backend (async) ]
   1. Claude  -> pick 5–8 candidate titles
   2. Per candidate, in parallel:
        - TMDb metadata + watch providers
        - IMDb rating + vote count (RapidAPI / scrape)
        - Letterboxd rating (scrape)
        - Metacritic score (scrape)
        - pacing inference
        - Claude -> "convince you" + "why you'll love it"
   3. composite score -> filter by floor -> sort best-first
        ▼
[ JSON: Recommendation[] ] -> React renders ranked cards
        │
        └── localStorage: watchlist + taste history (client only)
```

## 2. Technology Stack

| Layer | Choice | Rationale |
|---|---|---|
| Frontend | React + TypeScript, Tailwind CSS, shadcn/ui | Component-driven, typed contracts, fast styling, dark cinematic theme, mobile-first |
| Backend | FastAPI (Python) | Native async for parallel third-party fetches; Pydantic models give typed request/response validation |
| AI | Anthropic Claude API | Title selection + conviction/love-match generation |
| Movie data | TMDb API | Primary metadata + watch providers, region-aware |
| Ratings | IMDb (RapidAPI/scrape, primary & weighted), Letterboxd (scrape), Metacritic (scrape) | Transparent multi-source quality signal |
| Streaming | TMDb Watch Providers + JustWatch | Region-aware availability incl. Indian platforms |
| Storage | `localStorage` (MVP) → Firebase / Postgres (later) | No-auth MVP; server store deferred |
| Cache | Redis or in-memory / SQLite | Avoid re-fetching and re-scraping the same title |
| Deploy | GCP Cloud Run (backend) + Vercel/static host (frontend) | Local-first in dev, simple cloud path |

## 3. Component Design

### 3.1 Backend modules

| Module | Responsibility |
|---|---|
| `main.py` | FastAPI app, route definitions, CORS, startup config |
| `models.py` | Pydantic models: `UserPreferences`, `Recommendation`, detail models |
| `clients/tmdb.py` | TMDb search, detail, and watch-provider calls |
| `clients/claude.py` | Two Claude prompts: title selection; conviction + love-match |
| `clients/ratings.py` | IMDb / Letterboxd / Metacritic fetch + parse, all optional |
| `clients/providers.py` | JustWatch + TMDb provider reconciliation, region-aware |
| `services/scoring.py` | `composite_score`, `badge`, sort + floor |
| `services/pacing.py` | Phased pacing inference (heuristic → review classification → seeded labels) |
| `services/recommend.py` | Orchestration: candidates → parallel enrichment → score → sort |
| `cache.py` | Title-keyed cache wrapper (Redis or SQLite/in-memory) |

### 3.2 Frontend structure

```
src/
├─ components/
│  ├─ Questionnaire/  MoodStep, TimeStep, MediaTypeStep, GenreStep,
│  │                  SubGenreStep (conditional), PacingStep, OriginStep, ExamplesStep
│  ├─ Results/        ResultsList, MovieCard, RatingBadge, SortFilterBar
│  ├─ Watchlist/      WatchlistPage
│  └─ MovieDetailModal
├─ hooks/  useRecommendations.ts, useWatchlist.ts (localStorage)
├─ lib/    api.ts, types.ts
└─ App.tsx
```

## 4. Data Models

### 4.1 Request — `UserPreferences`

```python
class UserPreferences(BaseModel):
    mood: str                      # chill | energetic | emotional | dark | funny | surprise
    time: str                      # 20-30m | 1h | 2h+ | any
    media_type: str                # movie | show | either
    genres: list[str]              # up to 3
    subgenres: list[str] = []      # e.g. ["psychological_horror","slasher"]
    pacing: str = "any"            # slow | fast | any
    origin: str = "any"            # global | indian | both | any
    indian_langs: list[str] = []   # hindi, tamil, telugu, malayalam, ...
    recent_loves: list[str] = []   # personalization examples
    min_rating: float = 7.5        # quality floor
    sort_by: str = "composite"     # composite | imdb | votes | newest | runtime | letterboxd
```

### 4.2 Response — `Recommendation`

```python
class Recommendation(BaseModel):
    title: str
    year: int
    tmdb_id: int
    media_type: str
    composite_score: float
    rating_badge: str              # MASTERPIECE | CRITICALLY ACCLAIMED | ...
    imdb_rating: float
    imdb_votes: int
    letterboxd_rating: float | None
    metacritic_score: int | None
    synopsis: str
    convince_you: str              # AI persuasion paragraph
    why_youll_love_it: str         # AI taste-match paragraph
    genres: list[str]
    subgenres: list[str]
    pacing: str
    runtime_min: int
    language: str
    director: str
    cast: list[str]
    streaming_on: list[str]
    rent_buy_on: list[str]
    poster_url: str | None
```

## 5. Core Algorithms

### 5.1 Composite score (the differentiator)

```python
def composite_score(imdb, letterboxd, metacritic):
    # Normalize to /10, weight IMDb heaviest, renormalize over available sources
    lb_10   = (letterboxd * 2) if letterboxd else None
    meta_10 = (metacritic / 10) if metacritic else None
    parts, weights = [imdb], [0.5]
    if lb_10   is not None: parts.append(lb_10);   weights.append(0.3)
    if meta_10 is not None: parts.append(meta_10); weights.append(0.2)
    return sum(p * w for p, w in zip(parts, weights)) / sum(weights)
```

### 5.2 Quality floor + sort

```python
recs = [r for r in recs if r.imdb_rating >= prefs.min_rating]   # no mediocre titles
recs.sort(key=lambda r: (-r.composite_score, -r.imdb_votes))    # best first; votes break ties
```

### 5.3 Rating badge

```python
def badge(imdb):
    if imdb >= 9.0: return "MASTERPIECE"
    if imdb >= 8.0: return "CRITICALLY ACCLAIMED"
    if imdb >= 7.0: return "HIGHLY RATED"
    if imdb >= 6.0: return "GOOD"
    return "PASS"
```

### 5.4 Pacing inference (phased)

- **Phase 1 (cheap):** runtime heuristic — short likely faster; very long often slower. Weak signal, labeled "inferred."
- **Phase 2 (better):** scrape IMDb/Letterboxd review text; Claude classifies on keyword clusters ("slow-burn / atmospheric / meditative" vs. "gripping / non-stop / twists").
- **Phase 3 (best):** seeded manual/crowdsourced pacing labels for the top ~1000 titles, looked up first, falling back to Phase 2.

## 6. AI / Claude Integration

Two distinct prompts, each instructed to return **JSON only** (no markdown fences) and parsed defensively (strip fences, `try/except`):

1. **Title selection** — input: all preferences → output: JSON array of 5–8 candidate titles matching mood/sub-genre/pacing/origin, biased toward well-rated titles.
2. **Conviction + love-match** — per title, input: title + ratings + user mood + recent_loves + pacing + runtime → output: `convince_you` (lead with rating credibility, reference the user's taste, justify the time cost) and `why_youll_love_it` (taste-match to the user's examples).

To control latency and cost, conviction generation is batched and runs concurrently with metadata enrichment; results are cached by title.

## 7. External Integrations & Failure Handling

| Integration | Use | Failure mode handling |
|---|---|---|
| TMDb | Metadata, providers | Required; on failure, drop candidate or return error if all fail |
| Claude | Candidates, conviction | Candidates required; conviction optional (card still renders) |
| IMDb (RapidAPI/scrape) | Primary rating | Optional; if missing, exclude title from floor or treat conservatively |
| Letterboxd / Metacritic | Secondary ratings | Optional; treated as `None` in composite |
| JustWatch / TMDb providers | Streaming availability | Optional; show region note, may be empty |

All third-party calls are async and run in parallel per candidate. Network calls use timeouts, retry-with-backoff where safe, and aggressive title-keyed caching.

## 8. Security & Privacy

- API keys (TMDb, Anthropic, RapidAPI) live only in backend environment configuration and are never shipped to the client (SR-001).
- All third-party traffic is proxied through the backend (SR-002).
- No server-side PII in the MVP — preferences and watchlist are client-side `localStorage` only (SR-004).
- CORS is restricted to the deployed frontend origin.

## 9. Deployment & Environments

| Environment | Frontend | Backend | Notes |
|---|---|---|---|
| Local dev | Vite dev server | `uvicorn` local | `.env` holds keys; local-first development |
| Production | Vercel / static host | GCP Cloud Run | Cache via Redis (managed) or SQLite for a single instance |

Environment configuration provides `TMDB_API_KEY`, `ANTHROPIC_API_KEY`, `RAPIDAPI_KEY`, cache settings, and the allowed CORS origin.

## 10. Caching Strategy

A title-keyed cache (Redis in production, in-memory/SQLite for single-instance/dev) stores enrichment results (metadata, ratings, providers, conviction text) with a configurable TTL to cut latency and avoid repeated scraping (NFR-004). Cache keys incorporate the TMDb id and the data type.

## 11. Open Technical Decisions

- Cache backend choice (Redis vs. SQLite) for the first deploy.
- Standard RapidAPI IMDb endpoint vs. direct scraping trade-off.
- Whether to introduce a lightweight server store for watchlist sync before or after the public MVP.
- Concurrency limit / rate-limit budget per request to balance latency against third-party limits.

---

*This document is the engineering source of truth for system structure. Endpoint-level contracts are in the API Spec; requirement IDs map to modules in the Master SOP traceability matrix.*
