# Project Roadmap & Sprint Backlog
## "What Should I Watch Tonight?"

| Field | Value |
|---|---|
| Document | Project Roadmap & Sprint Backlog |
| Product | What Should I Watch Tonight? (WSIWT) |
| Owner | Lakshya Dharwal |
| Version | v1.0 |
| Status | Draft |
| Date | June 17, 2026 |
| Related docs | PRD, SRS, Technical Design, Master SOP |

---

## 1. Roadmap Overview

| Phase | Theme | Target window | Outcome |
|---|---|---|---|
| Phase 0 | Setup | Day 1 | Repos scaffolded, keys verified |
| Phase 1 | MVP | Week 1 | End-to-end recommend flow + watchlist |
| Phase 2 | Layered preferences | Week 2 | Sub-genre, pacing, origin + full composite + conviction |
| Phase 3 | Pacing + Indian depth | Week 3 | Review-based pacing, Indian providers, caching |
| Phase 4 | Polish & deploy | Week 4+ | Design system applied, detail modal, deployed |

## 2. Milestones

- **M1 — Walking skeleton:** `/recommend` returns mock data; React calls it. (End of Phase 0)
- **M2 — MVP Definition of Done:** ranked real picks, IMDb-primary, watchlist persists, mobile. (End of Phase 1)
- **M3 — Differentiators live:** composite from all sources, conviction layer, sort/filter. (End of Phase 2)
- **M4 — Depth:** review-based pacing + Indian streaming accuracy + caching. (End of Phase 3)
- **M5 — Launch candidate:** full minimal-noir design system, detail modal, deployed. (Phase 4)

## 3. Sprint Backlog

Story IDs map to requirement IDs in the SRS and to the traceability matrix in the Master SOP (Appendix D). Estimates are relative points (1 = a few hours, 5 = ~a day+).

### Sprint 0 — Setup (Phase 0)

| Story | Description | Pts | Traces |
|---|---|---|---|
| S0-1 | Scaffold frontend (Vite + React + TS + Tailwind + shadcn/ui) and backend (FastAPI) repos | 3 | — |
| S0-2 | Env config for TMDb, Anthropic, RapidAPI keys (backend only) | 1 | SR-001 |
| S0-3 | Throwaway script to verify TMDb search + Claude call | 2 | — |
| S0-4 | `/health` endpoint + stub `/recommend` returning mock data | 2 | M1 |

### Sprint 1 — MVP (Phase 1)

| Story | Description | Pts | Traces |
|---|---|---|---|
| S1-1 | Questionnaire MVP steps: mood, time, media type, genre, examples | 5 | FR-001, FR-002, FR-006 |
| S1-2 | Claude title-selection prompt; JSON-only defensive parsing | 3 | FR-010, FR-011 |
| S1-3 | TMDb enrichment → map to `Recommendation` | 3 | FR-012 |
| S1-4 | `composite_score`, badge, sort + quality floor (IMDb-only acceptable here) | 3 | FR-015–FR-018 |
| S1-5 | Results list + MovieCard (IMDb-primary, synopsis, why-you'll-love-it, streaming) | 5 | FR-030 |
| S1-6 | Watchlist via `localStorage` | 2 | FR-040–FR-042 |
| S1-7 | Loading + error states | 2 | NFR-006 |

### Sprint 2 — Layered preferences (Phase 2)

| Story | Description | Pts | Traces |
|---|---|---|---|
| S2-1 | Sub-genre step (conditional on genre) | 3 | FR-003 |
| S2-2 | Pacing step | 1 | FR-004 |
| S2-3 | Origin step + Indian language picker | 3 | FR-005 |
| S2-4 | IMDb + Letterboxd + Metacritic fetch → full composite | 5 | FR-013–FR-015 |
| S2-5 | Conviction layer ("convince you") generation, batched | 3 | FR-020 |
| S2-6 | SortFilterBar (sort + adjustable min-rating) | 3 | FR-031, FR-032 |

### Sprint 3 — Pacing + Indian depth (Phase 3)

| Story | Description | Pts | Traces |
|---|---|---|---|
| S3-1 | Pacing inference: review scraping + Claude classification | 5 | FR-004 (Phase 2 method) |
| S3-2 | Seed manual pacing labels for top titles | 3 | FR-004 (Phase 3 method) |
| S3-3 | Indian streaming providers via JustWatch/TMDb + region verification | 5 | FR-035, SR-005 |
| S3-4 | Title-keyed caching layer | 3 | NFR-004 |

### Sprint 4 — Polish & deploy (Phase 4)

| Story | Description | Pts | Traces |
|---|---|---|---|
| S4-1 | Apply minimal-noir design system (tokens, type, glass, motion) | 5 | NFR-007 |
| S4-2 | Mobile responsiveness pass | 3 | NFR-003 |
| S4-3 | MovieDetailModal (cast, budget, full synopsis, providers) | 3 | FR-034 |
| S4-4 | Deploy backend to Cloud Run, frontend to static host | 3 | — |
| S4-5 | Performance pass to hit p75 < 8s (parallel fetch + cache) | 3 | NFR-001 |

## 4. First Coding Tasks (start here)

1. Scaffold FastAPI app with `/health` and a stub `/recommend` returning mock data.
2. Wire TMDb search + detail fetch; map to `Recommendation`.
3. Add Claude title-selection prompt; parse JSON-only output.
4. Implement `composite_score`, badge, sort + floor.
5. Build React questionnaire (MVP steps) + results cards against the live endpoint.
6. Add watchlist (`localStorage`) and the sort/filter bar.

## 5. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| No official Letterboxd/IMDb APIs | Lightweight scraping with caching, or RapidAPI IMDb endpoint; degrade gracefully if missing |
| Scraping fragility / rate limits | Cache aggressively, back off, treat missing ratings as `None` in composite |
| Streaming data accuracy (esp. India) | Combine TMDb providers + JustWatch; show region note |
| Pacing is subjective | Start heuristic, layer review-based classification, label as "inferred" |
| Claude latency (per-title calls) | Batch conviction generation; async parallel fetch; cache by title |
| API key exposure | Never ship keys to frontend; all third-party calls go through backend |

## 6. Definition of Done (MVP)

- User completes the questionnaire in under ~60 seconds.
- Returns 3–5 ranked picks, best composite rating first, none below the rating floor.
- Each card shows IMDb-primary ratings, synopsis, "why you'll love it," and where to stream.
- Watchlist persists across reloads.
- Works on mobile.

---

*Sprint stories are the planning unit; their status and any scope changes are tracked in the Master SOP change log.*
