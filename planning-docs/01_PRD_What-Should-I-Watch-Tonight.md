# Product Requirements Document (PRD)
## "What Should I Watch Tonight?" — A Rating-First Movie & TV Recommendation App

| Field | Value |
|---|---|
| Document | Product Requirements Document (PRD) |
| Product | What Should I Watch Tonight? (working title: *WSIWT*) |
| Owner | Lakshya Dharwal |
| Version | v1.0 |
| Status | Draft |
| Date | June 17, 2026 |
| Related docs | SRS, Technical Design, API Spec, UX Spec, Roadmap, Master SOP |

---

## 1. Overview

**What Should I Watch Tonight?** is a web app that ends the "endless scroll." A user answers a short questionnaire about mood, available time, genre, sub-genre, pacing, and content origin, and the app returns 3–5 hand-picked movie or show recommendations. Unlike the major streaming platforms, the app's defining behavior is that **the best-rated titles always surface first** — never a "new but mediocre" feed.

The product layers three things competitors do not combine: (1) a transparent, IMDb-weighted **composite rating** that sorts results by quality, (2) an AI-generated **conviction layer** that argues *why this title deserves your two hours*, and (3) first-class **Indian-content support** (languages and regional streaming providers) alongside global titles.

## 2. Problem Statement

People spend more time deciding what to watch than they would like, and existing platforms optimize for engagement and catalog churn rather than for quality-matched picks. Three concrete problems:

1. **Decision fatigue.** Infinite grids with weak signals push users toward whatever is newest or most heavily promoted, not what is actually good for their mood and time budget.
2. **Opaque ranking.** Streaming recommendations are black boxes tuned to retention. Users cannot see *why* something is recommended or whether it is genuinely well-reviewed.
3. **Fragmented quality + availability signals.** Ratings (IMDb, Letterboxd, Metacritic) and "where to stream" data live in different places, and Indian-language content is poorly served by global-first tools.

## 3. Vision & Goals

**Vision:** Become the fastest path from "I have two hours" to "I am pressing play on something genuinely worth watching."

**Primary goals (MVP):**

- Deliver 3–5 ranked recommendations in under 60 seconds of user effort.
- Guarantee that results are sorted best-rated-first and never fall below a quality floor.
- Make every recommendation *persuasive and transparent*: show the ratings and explain the match.
- Support both global and Indian content from day one of the layered-preferences phase.

**Non-goals (for now):** Becoming a streaming service, hosting video, building a social network, or replacing IMDb/Letterboxd as a ratings database.

## 4. Target Users & Personas

**Persona A — "The Decider" (primary).** 18–35, watches several times a week across 3–4 subscriptions, hates wasting an evening on a bad pick. Wants a fast, trustworthy shortlist and proof that a title is worth it.

**Persona B — "The Mood Viewer."** Knows the *feeling* they want (chill, intense, emotional, funny) but not a specific title. Needs the questionnaire to translate mood into concrete, well-rated picks.

**Persona C — "The Regional Viewer."** Wants strong Hindi / Tamil / Telugu / Malayalam (and other Indian-language) recommendations with accurate "where to stream in India" info (Zee5, Hotstar, SonyLiv, Prime India, Netflix India, Mubi).

## 5. Value Proposition & Differentiators

| Differentiator | What it means | Why competitors don't do it |
|---|---|---|
| **Rating-first sorting** | Composite score (IMDb-weighted) sorts best titles to the top; a minimum-rating floor (default 7.5 IMDb) filters out the mediocre | Streaming platforms optimize for engagement/catalog freshness, not quality |
| **Conviction layer** | AI writes a short "I want to convince you" paragraph per title, leading with rating credibility and the user's taste | Recommenders list titles; they don't argue for them |
| **Transparent ratings** | IMDb (primary), Letterboxd, Metacritic shown openly with a quality badge | Platform algorithms are opaque |
| **Layered preferences** | Mood → time → media type → genre → sub-genre → pacing → origin → examples | Most tools stop at genre |
| **Indian-content support** | Language picker + region-aware streaming providers | Global-first tools under-serve Indian content |

## 6. Scope

### 6.1 In scope (MVP, Phases 1–2)

- Multi-step preference questionnaire (mood, time, media type, genre, examples; then sub-genre, pacing, origin/language).
- `/recommend` flow: Claude title selection → TMDb enrichment → multi-source ratings → composite scoring → quality floor → ranked results.
- Result cards: IMDb-primary rating block, quality badge, synopsis, "why you'll love it," "convince you," streaming availability, runtime, genres.
- Sort & filter bar (sort by composite / IMDb / votes / newest / runtime / Letterboxd; adjustable minimum rating).
- Watchlist persisted in `localStorage`.
- Movie detail modal (cast, director, full synopsis, providers).
- Dark cinematic, mobile-first UI.

### 6.2 Out of scope (MVP)

- User accounts / authentication / cross-device sync (deferred to a later phase with Firebase/Postgres).
- Video playback or trailer hosting (trailers, if shown, are embedded via YouTube).
- Social features (following, sharing feeds, comments).
- Native mobile apps (responsive web only).
- Paid subscriptions / monetization.

## 7. Functional Requirements (Summary)

Full, testable requirements with IDs live in the **SRS** and **Master SOP**. At a product level the app shall:

- Capture layered preferences through a guided questionnaire that a user can complete in ~60 seconds.
- Generate 5–8 candidate titles via the Claude API biased toward well-rated matches, then enrich each with metadata, ratings, and streaming availability.
- Compute a composite score, apply a minimum-rating floor, and return 3–5 ranked results best-first.
- Generate per-title "why you'll love it" and "convince you" text grounded in the user's stated taste.
- Let users re-sort, adjust the rating floor, save to a watchlist, and open a detail view.

## 8. Non-Functional Requirements (Summary)

The app shall return results within a target of ~8 seconds for a typical request (parallel data fetching), degrade gracefully when a ratings source is missing, never expose third-party API keys to the client, cache results by title to cut latency and repeated scraping, and remain fully usable on a mobile screen.

## 9. Success Metrics

| Metric | Target (MVP) |
|---|---|
| Time to complete questionnaire | Under 60 seconds (median) |
| Time to first results rendered | Under 8 seconds (p75) |
| Recommendations per session | 3–5, all at or above the rating floor |
| "Helpful pick" rate (thumbs-up on a returned card) | ≥ 60% of sessions mark at least one pick useful |
| Watchlist adds per session | ≥ 0.5 average |
| Return usage | ≥ 30% of users run a second search within 7 days |

## 10. Assumptions & Dependencies

- TMDb API is the primary metadata and watch-provider source; an Anthropic Claude API key is available for title selection and conviction text.
- IMDb / Letterboxd / Metacritic ratings are obtained via RapidAPI or lightweight scraping; these may be missing for some titles and are treated as optional inputs to the composite score.
- JustWatch + TMDb providers supply region-aware "where to stream," including Indian platforms.
- MVP storage is client-side (`localStorage`); a server-side store is a later decision.

## 11. Risks (Product-Level)

| Risk | Impact | Mitigation |
|---|---|---|
| No official Letterboxd/IMDb API | Ratings gaps weaken the core differentiator | Cache aggressively, use RapidAPI where possible, degrade gracefully to IMDb-only composite |
| Streaming availability inaccuracy (esp. India) | Erodes trust | Combine TMDb providers + JustWatch, show a region note, label as "availability may vary" |
| Per-title Claude latency | Slow results hurt the 60-second promise | Batch conviction generation, async-parallel fetch, cache by title |
| Pacing is subjective | "Fast/slow" labels may feel wrong | Start with a heuristic, layer review-based classification, label results as "inferred" |

## 12. Open Questions

- Do we introduce optional accounts in the MVP, or stay fully anonymous with `localStorage`?
- Which RapidAPI IMDb endpoint (cost vs. coverage) do we standardize on?
- What is the initial set of seeded "manual pacing labels" (top N titles)?
- Do we embed trailers in the MVP or defer to the detail modal only?

---

*This PRD is the product source of truth. Engineering detail lives in the SRS, Technical Design, and API Spec; tracking and history live in the Master SOP.*
