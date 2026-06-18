# The AI Build Prompt
## "What Should I Watch Tonight?" — ready-to-paste prompt for an AI coding agent

| Field | Value |
|---|---|
| Document | AI Build Prompt |
| Product | What Should I Watch Tonight? (WSIWT) |
| Owner | Lakshya Dharwal |
| Version | v1.0 |
| Date | June 17, 2026 |
| How to use | Paste the block in Section 2 into your coding agent (Claude Code, Cursor, etc.). Build phase by phase; don't paste all phases at once. |

---

## 1. How to use this

This is a master prompt that gives a coding agent the full context to scaffold and build the app. Best practice:

1. Start with the **System / Context** block (Section 2) so the agent knows the stack, models, and rules.
2. Then paste one **Phase prompt** (Section 3) at a time. Verify each phase runs before moving on.
3. Keep the design direction fixed: sophisticated minimalism × cinematic dark mode — near-black `#0F0F0F`, single emerald accent, sans-first with serif headlines, image-first 10px cards, flat subtle shadows, restrained functional motion.

---

## 2. System / Context Prompt (paste first)

```
You are helping me build a web app called "What Should I Watch Tonight?" — a
rating-first movie & TV recommendation app. The core differentiator: the
best-rated titles ALWAYS surface first, with a quality floor that filters out
mediocre picks. Read this context and follow it exactly.

STACK
- Frontend: React + TypeScript, Vite, Tailwind CSS, shadcn/ui. Mobile-first.
- Backend: FastAPI (Python), fully async. Pydantic models.
- AI: Anthropic Claude API (two prompts: title selection; conviction text).
- Data: TMDb API (metadata + watch providers). IMDb (RapidAPI or scrape, PRIMARY
  rating), Letterboxd (scrape), Metacritic (scrape) — all OPTIONAL inputs.
- Streaming availability: JustWatch + TMDb providers, region-aware (incl. India).
- Storage (MVP): browser localStorage only (watchlist + preferences). No auth.
- Cache: title-keyed (Redis in prod, in-memory/SQLite in dev).

HARD RULES
- All third-party API keys live ONLY on the backend; never ship them to the
  client. The frontend talks only to our backend REST API.
- Claude must return JSON only (no markdown fences). Parse defensively: strip
  fences, try/except, never crash on a bad model response.
- Every rating source and provider list is OPTIONAL. Missing data becomes null
  and must NOT block a result or break the UI.
- Results are ALWAYS sorted best-composite-first and filtered by a minimum IMDb
  rating (default 7.5). This is the product's whole point — never violate it.

DATA MODELS (Pydantic)
UserPreferences:
  mood: str            # chill|energetic|emotional|dark|funny|surprise
  time: str            # 20-30m|1h|2h+|any
  media_type: str      # movie|show|either
  genres: list[str]    # up to 3
  subgenres: list[str] = []
  pacing: str = "any"  # slow|fast|any
  origin: str = "any"  # global|indian|both|any
  indian_langs: list[str] = []
  recent_loves: list[str] = []
  min_rating: float = 7.5
  sort_by: str = "composite"  # composite|imdb|votes|newest|runtime|letterboxd

Recommendation:
  title, year, tmdb_id, media_type, composite_score, rating_badge,
  imdb_rating, imdb_votes, letterboxd_rating|None, metacritic_score|None,
  synopsis, convince_you, why_youll_love_it, genres[], subgenres[], pacing,
  runtime_min, language, director, cast[], streaming_on[], rent_buy_on[],
  poster_url|None

ENDPOINTS
  POST /recommend          -> { results: Recommendation[] }
  GET  /movie/{tmdb_id}    -> MovieDetail
  GET  /health             -> { status: "ok" }

CORE LOGIC
  composite_score(imdb, letterboxd, metacritic): normalize to /10
    (letterboxd*2, metacritic/10), weights imdb 0.5, letterboxd 0.3,
    metacritic 0.2, renormalized over available sources.
  badge(imdb): >=9 MASTERPIECE, >=8 CRITICALLY ACCLAIMED, >=7 HIGHLY RATED,
    >=6 GOOD, else PASS.
  filter: drop any title with imdb_rating < min_rating.
  sort: by (-composite_score, -imdb_votes).

DESIGN DIRECTION (apply when building UI)
  Philosophy: "Sophisticated minimalism × cinematic dark mode." Dark, high-
  contrast, image-first, minimal-UI, single-accent, generous-spacing, card-based
  modular layout with aggressive type hierarchy. Effects are restrained.
  Color: near-black bg #0F0F0F; surfaces #161616 / #1F1F1F; near-white text
  #F5F5F5 (secondary #B5B5B5). Single accent emerald/teal #2FD3A5 for ALL
  interactive elements + rating numerals; gold #E6C36B ONLY for the MASTERPIECE
  badge. No other colors.
  Typography: SANS-FIRST. Inter for body/UI/card titles (titles bold); display
  serif "Fraunces" reserved for HEADLINES ONLY (landing hero, step questions);
  mono "JetBrains Mono" for rating numerals. Hierarchy is aggressive — big bold
  headlines, small quiet metadata, no middle sizes.
  Layout: image-first cards where the poster fills 40-60% of the card; rounded
  corners ~10px (sheets 16px, pill buttons); ~1.5rem (24px) gaps, cards never
  touch; generous negative space; minimal metadata on cards (title, year,
  rating, one-line hook) with cast/synopsis/providers behind "More info"
  (progressive disclosure); oversized accent CTAs; horizontal carousels for
  sets; minimal nav (bottom nav mobile, slim sidebar desktop); ratings always
  prominent.
  Depth & effects: FLAT with subtle shadows only (card 0 4px 16px rgba(0,0,0,
  .45), hover slightly deeper). NO glassmorphism / backdrop-blur. Motion is
  functional and brief: quick step crossfade, ~1.02 hover scale, simple card
  fade-in, skeleton shimmer loads. No parallax, no theatrical animation. Motion
  never delays content; respect prefers-reduced-motion.

Confirm you understand, then wait for the phase instruction.
```

---

## 3. Phase Prompts (paste one at a time)

### Phase 0 — Scaffold

```
Scaffold the project:
- /backend: FastAPI app with main.py, models.py (the Pydantic models above),
  a clients/ package (tmdb, claude, ratings, providers stubs), services/
  (scoring, pacing, recommend stubs), cache.py, and .env handling for
  TMDB_API_KEY, ANTHROPIC_API_KEY, RAPIDAPI_KEY. Add GET /health and a stub
  POST /recommend that returns 2 mock Recommendation objects. Enable CORS for
  the frontend origin.
- /frontend: Vite + React + TS + Tailwind + shadcn/ui. Set up the design tokens
  (CSS variables) from the design direction. Add lib/api.ts and lib/types.ts
  mirroring the models. Render a placeholder that calls /recommend and lists the
  mock results.
Give me run instructions for both.
```

### Phase 1 — MVP flow

```
Implement the MVP:
- Backend: clients/tmdb.py (search + detail + watch providers); clients/claude.py
  title-selection prompt returning 5-8 candidate titles as JSON only (parse
  defensively); services/scoring.py (composite_score, badge, filter, sort);
  services/recommend.py orchestrating candidates -> async parallel TMDb
  enrichment -> score -> floor -> sort -> top 3-5. IMDb-only composite is fine
  for now.
- Frontend: Questionnaire steps (Mood, Time, MediaType, Genre, Examples) one per
  screen with the minimal-noir styling and emerald selection states; a thin
  emerald progress bar; ResultsList + MovieCard showing IMDb-primary rating +
  badge, synopsis, why_youll_love_it, streaming; Watchlist via localStorage;
  loading skeletons and error states.
```

### Phase 2 — Layered preferences + full composite + conviction

```
Add: conditional SubGenre step, Pacing step, Origin step + Indian language
picker. Backend: clients/ratings.py to fetch IMDb + Letterboxd + Metacritic
(all optional, cached) and compute the full composite. clients/claude.py second
prompt for convince_you + why_youll_love_it (batched, concurrent, JSON only,
graceful on failure). Frontend: SortFilterBar (sort dropdown + min-rating slider
default 7.5) and the "convince you" section on the card.
```

### Phase 3 — Pacing depth + Indian streaming + caching

```
Add: pacing inference (scrape IMDb/Letterboxd reviews, Claude classifies
slow vs fast; seed manual labels for top titles; label results "inferred").
clients/providers.py reconciling JustWatch + TMDb providers region-aware,
surfacing Indian platforms (Zee5, Hotstar, SonyLiv, Prime India, Netflix India,
Mubi) with a region note. cache.py title-keyed caching with TTL.
```

### Phase 4 — Polish & deploy

```
Apply the full design system (near-black #0F0F0F, emerald accent, sans-first
with serif headlines, image-first 10px-radius cards, flat subtle shadows,
restrained functional motion), add the MovieDetailModal (cast, budget, full
synopsis, providers), do a mobile responsiveness + accessibility pass
(keyboard nav, focus ring, prefers-reduced-motion), optimize for p75 < 8s via
parallel fetch + cache, and deploy backend to GCP Cloud Run and frontend to a
static host. Give me deploy steps.
```

---

## 4. Reminders for the agent

- Verify each phase runs end to end before starting the next.
- Keep secrets backend-only; never expose keys in client code or commits.
- Treat all ratings/providers as optional; never let missing data crash a request or the UI.
- Never break best-first sorting or the rating floor — that is the product.

---

*Prompts mirror the requirements (SRS), architecture (TDD), API contract (API Spec), and design system (UX Spec). If those change, update this prompt and log it in the Master SOP.*
