# API Specification & Data Contract
## "What Should I Watch Tonight?" — Backend REST API

| Field | Value |
|---|---|
| Document | API Specification & Data Contract |
| Product | What Should I Watch Tonight? (WSIWT) |
| Owner | Lakshya Dharwal |
| Version | v1.0 |
| Status | Draft |
| Date | June 17, 2026 |
| Base URL (dev) | `http://localhost:8000` |
| Base URL (prod) | `https://<cloud-run-service>/` |
| Format | JSON over HTTPS; UTF-8 |
| Related docs | Technical Design, SRS, Master SOP |

---

## 1. Conventions

- All request and response bodies are JSON.
- Timestamps (where present) are ISO 8601 UTC.
- Optional/unknown rating fields are returned as `null`, never omitted.
- Errors use a consistent envelope (Section 6).
- The frontend communicates exclusively through these endpoints; all third-party calls happen server-side.

## 2. Endpoint Summary

| Method | Route | Purpose | Auth |
|---|---|---|---|
| POST | `/recommend` | Preferences → ranked recommendations | None (MVP) |
| GET | `/movie/{tmdb_id}` | Full detail for the detail modal | None (MVP) |
| GET | `/health` | Liveness check | None |

## 3. POST `/recommend`

Main flow. Accepts user preferences, returns 3–5 ranked recommendations (best composite first, none below the rating floor).

### 3.1 Request body — `UserPreferences`

```json
{
  "mood": "dark",
  "time": "2h+",
  "media_type": "movie",
  "genres": ["thriller", "scifi"],
  "subgenres": ["psychological", "time_travel"],
  "pacing": "any",
  "origin": "both",
  "indian_langs": ["hindi", "malayalam"],
  "recent_loves": ["Severance", "Prisoners"],
  "min_rating": 7.5,
  "sort_by": "composite"
}
```

| Field | Type | Required | Allowed values / notes |
|---|---|---|---|
| `mood` | string | yes | `chill` `energetic` `emotional` `dark` `funny` `surprise` |
| `time` | string | yes | `20-30m` `1h` `2h+` `any` |
| `media_type` | string | yes | `movie` `show` `either` |
| `genres` | string[] | yes | up to 3 |
| `subgenres` | string[] | no | conditional on genre |
| `pacing` | string | no | `slow` `fast` `any` (default `any`) |
| `origin` | string | no | `global` `indian` `both` `any` (default `any`) |
| `indian_langs` | string[] | no | `hindi` `tamil` `telugu` `kannada` `malayalam` `punjabi` `marathi` `bengali` |
| `recent_loves` | string[] | no | free-text example titles |
| `min_rating` | number | no | default `7.5` |
| `sort_by` | string | no | `composite` `imdb` `votes` `newest` `runtime` `letterboxd` (default `composite`) |

### 3.2 Response body — `{ "results": Recommendation[] }`

```json
{
  "results": [
    {
      "title": "Prisoners",
      "year": 2013,
      "tmdb_id": 146233,
      "media_type": "movie",
      "composite_score": 8.4,
      "rating_badge": "CRITICALLY ACCLAIMED",
      "imdb_rating": 8.2,
      "imdb_votes": 760000,
      "letterboxd_rating": 4.1,
      "metacritic_score": 74,
      "synopsis": "When his daughter goes missing, a father takes matters into his own hands.",
      "convince_you": "At 8.2 on IMDb with 760k votes, this is proven, not hyped...",
      "why_youll_love_it": "If Prisoners-style dread and the slow unraveling of Severance hooked you...",
      "genres": ["Thriller", "Crime", "Drama"],
      "subgenres": ["psychological"],
      "pacing": "slow",
      "runtime_min": 153,
      "language": "en",
      "director": "Denis Villeneuve",
      "cast": ["Hugh Jackman", "Jake Gyllenhaal"],
      "streaming_on": ["Netflix"],
      "rent_buy_on": ["Prime Video", "Apple TV"],
      "poster_url": "https://image.tmdb.org/t/p/w500/..."
    }
  ]
}
```

| Field | Type | Notes |
|---|---|---|
| `title` | string | |
| `year` | integer | |
| `tmdb_id` | integer | used by `/movie/{tmdb_id}` |
| `media_type` | string | `movie` or `show` |
| `composite_score` | number | /10, IMDb-weighted, renormalized over available sources |
| `rating_badge` | string | `MASTERPIECE` `CRITICALLY ACCLAIMED` `HIGHLY RATED` `GOOD` `PASS` |
| `imdb_rating` | number | primary metric |
| `imdb_votes` | integer | tie-breaker in sort |
| `letterboxd_rating` | number \| null | /5 scale as returned by source |
| `metacritic_score` | integer \| null | /100 |
| `synopsis` | string | |
| `convince_you` | string | AI persuasion paragraph |
| `why_youll_love_it` | string | AI taste-match paragraph |
| `genres` | string[] | |
| `subgenres` | string[] | |
| `pacing` | string | `slow` `fast` `any` (may be `inferred`-labeled) |
| `runtime_min` | integer | |
| `language` | string | ISO code or label |
| `director` | string | |
| `cast` | string[] | top-billed |
| `streaming_on` | string[] | subscription providers (region-aware) |
| `rent_buy_on` | string[] | rent/buy providers |
| `poster_url` | string \| null | |

### 3.3 Behavior notes

- The backend requests 5–8 candidates from Claude, enriches each in parallel, scores, filters by `min_rating`, sorts by `sort_by` (default composite desc, votes tie-break), and returns 3–5.
- Missing rating sources do not block a result; they appear as `null` and are excluded from the composite weighting.
- Conviction text generation failures do not block a result; the card renders without that text.

## 4. GET `/movie/{tmdb_id}`

Returns extended detail for the detail modal.

**Path param:** `tmdb_id` (integer, required).

**Response (`MovieDetail`):**

```json
{
  "tmdb_id": 146233,
  "title": "Prisoners",
  "year": 2013,
  "media_type": "movie",
  "full_synopsis": "Full overview text...",
  "director": "Denis Villeneuve",
  "cast": ["Hugh Jackman", "Jake Gyllenhaal", "Viola Davis"],
  "runtime_min": 153,
  "genres": ["Thriller", "Crime", "Drama"],
  "language": "en",
  "budget": 46000000,
  "imdb_rating": 8.2,
  "letterboxd_rating": 4.1,
  "metacritic_score": 74,
  "streaming_on": ["Netflix"],
  "rent_buy_on": ["Prime Video", "Apple TV"],
  "poster_url": "https://image.tmdb.org/t/p/w500/...",
  "backdrop_url": "https://image.tmdb.org/t/p/w1280/..."
}
```

## 5. GET `/health`

Liveness probe. Returns `200 OK` with `{ "status": "ok" }`.

## 6. Error Handling

All errors return a consistent envelope with an appropriate HTTP status:

```json
{ "error": { "code": "UPSTREAM_FAILURE", "message": "TMDb is unavailable, please retry.", "detail": null } }
```

| HTTP | `code` | When |
|---|---|---|
| 400 | `INVALID_REQUEST` | Malformed body, bad enum value, missing required field |
| 422 | `VALIDATION_ERROR` | Pydantic validation failure (FastAPI default shape mapped to envelope) |
| 429 | `RATE_LIMITED` | Upstream rate limit hit; client should back off |
| 502 | `UPSTREAM_FAILURE` | TMDb / Claude / ratings source failed and no graceful fallback exists |
| 504 | `UPSTREAM_TIMEOUT` | Upstream call exceeded timeout budget |
| 500 | `INTERNAL_ERROR` | Unhandled server error |

If only *some* enrichment fails, the endpoint still returns `200` with partial fields set to `null` rather than an error.

## 7. External APIs (server-side only)

| API | Used by | Notes |
|---|---|---|
| TMDb | `/recommend`, `/movie` | Metadata, watch providers; requires `TMDB_API_KEY` |
| Anthropic Claude | `/recommend` | Title selection + conviction; requires `ANTHROPIC_API_KEY`; JSON-only outputs |
| IMDb (RapidAPI/scrape) | `/recommend`, `/movie` | Primary rating; `RAPIDAPI_KEY` if used |
| Letterboxd / Metacritic | `/recommend`, `/movie` | Scraped, optional, cached |
| JustWatch | `/recommend`, `/movie` | Region-aware availability |

All keys are backend-only (SR-001). No third-party credentials are ever returned to the client.

## 8. Versioning

This is API v1. Breaking changes introduce a new prefix (`/v2/...`) and are recorded in the Master SOP change log. Additive, optional fields are non-breaking.

---

*This contract is binding between the frontend and backend. Any field change must update the SRS data requirements and the Master SOP change log.*
