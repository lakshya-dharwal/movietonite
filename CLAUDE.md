# CLAUDE.md — "What Should I Watch Tonight?"

This file is the entry point for Claude Code. Read it first, then read the docs it points to before writing code.

## What we're building

A **rating-first** movie & TV recommendation web app. A user answers a short questionnaire (mood, time, genre, sub-genre, pacing, origin, examples) and gets 3–5 ranked picks. **The whole point: best-rated titles always surface first, with a quality floor that removes mediocre picks.** Plus an AI "conviction" layer that argues why a title is worth watching, transparent multi-source ratings, and first-class Indian-content support.

## Non-negotiable rules (do not violate)

1. **Rating-first always.** Results are sorted by composite score descending (IMDb votes tie-break) and filtered by `min_rating` (default 7.5). Never ship a feed that breaks this.
2. **Secrets are backend-only.** TMDb / Anthropic / RapidAPI keys live in backend env, never in client code, never committed. All third-party calls are proxied through the backend.
3. **Claude returns JSON only**, parsed defensively (strip fences, try/except). A bad model response must never crash a request.
4. **Every rating source and provider is optional.** Missing data becomes `null`, never an error, and must not break the UI.
5. **Validate every request on the backend** (Pydantic + bounds). The frontend is never the security boundary.
6. **Logic lives in backend `services/`**, not in React components.

## Tech stack

- Frontend: React + TypeScript, Vite, Tailwind, shadcn/ui. Mobile-first.
- Backend: FastAPI (async), Pydantic models.
- AI: Anthropic Claude API. Data: TMDb. Ratings: IMDb (primary) + Letterboxd + Metacritic. Availability: JustWatch + TMDb providers.
- Storage: **MVP = `localStorage` only, no auth.** Production (Phase 5+) = Postgres + accounts.
- Deploy: Cloud Run (backend) + Vercel/static (frontend).

## Scope boundary (read this before adding features)

- **MVP (Phases 0–4):** anonymous, no accounts, no database, `localStorage` watchlist/feedback. Build this first.
- **Production (Phase 5+):** accounts, Postgres, CRUD, authorization, full security/observability. Specs already exist — do **not** improvise auth/DB; follow docs 10 and 11.

## Documents — read in this order

| When | Doc |
|---|---|
| Kickoff (paste phase by phase) | `planning-docs/08_AI-Build-Prompt.md` |
| Architecture + contracts | `planning-docs/03_Technical-Design-Architecture.md`, `planning-docs/04_API-Specification.md` |
| What to build & verify (requirement IDs) | `planning-docs/02_SRS_Software-Requirements-Specification.md` |
| UI work | `planning-docs/05_UX-UI-Design-Spec-and-Design-System.md` |
| Engineering standards / production gate | `planning-docs/09_Engineering-Standards-and-Production-Readiness.md` |
| Data (Phase 5+) | `planning-docs/10_Data-Model-and-Database-Schema.md` |
| Auth (Phase 5+) | `planning-docs/11_Auth-and-Authorization-Spec.md` |
| Why / context & tracking | `planning-docs/01_PRD...`, `planning-docs/00_MASTER-SOP...` |

## Design system (when building UI)

Sophisticated minimalism × cinematic dark mode: near-black `#0F0F0F`, single **emerald** accent `#2FD3A5` (gold `#E6C36B` only for the MASTERPIECE badge), **sans-first** (Inter) with **serif headlines** (Fraunces), mono (JetBrains Mono) for ratings. Image-first cards, ~10px radius, ~1.5rem gaps, flat with subtle shadows (no glassmorphism), restrained functional motion, minimal metadata + progressive disclosure, oversized accent CTAs. Full detail in doc 05.

## Build order

Follow `06_Project-Roadmap-and-Sprint-Backlog.md`: Phase 0 scaffold → 1 MVP flow → 2 layered prefs + full composite + conviction → 3 pacing + Indian + caching → 4 polish + deploy → (5+ accounts + DB per docs 10/11). Verify each phase end-to-end before the next.

## Environment

Use env vars only; commit `.env.example`, git-ignore `.env`. MVP backend vars: `TMDB_API_KEY`, `ANTHROPIC_API_KEY`, `RAPIDAPI_KEY`, `ALLOWED_ORIGIN`, `CACHE_BACKEND`, `CACHE_TTL_SECONDS`, `RATE_LIMIT_PER_MIN`. Frontend: `VITE_API_BASE_URL`. (Full list in doc 09 §8.)

## Commands (fill in once scaffolded)

```bash
# backend
cd backend && uvicorn main:app --reload
# frontend
cd frontend && npm run dev
# tests
cd backend && pytest
```

## Git hygiene

Small, frequent commits (Conventional Commits: `feat:`/`fix:`/`chore:`). Branch per feature/phase. Commit before any large AI-driven rewrite so a bad change is one `git revert` away. Tag milestones (`v0.1-mvp`).

## Definition of Done (MVP)

Questionnaire under ~60s → 3–5 ranked picks, best composite first, none below the floor → each card shows IMDb-primary rating + badge + synopsis + why-you'll-love-it + where to stream → watchlist persists across reload → works on mobile → unit/contract/integration tests pass → loading/empty/error states present → deployed with env config, CORS, HTTPS, health check, logs. (See doc 09 production-readiness checklist.)

## Before finishing any phase

Run the relevant tests, confirm no secrets are in client code or commits, confirm graceful degradation on missing data, and confirm rating-first sorting + floor still hold. Update the Master SOP change log if a contract, requirement, or design decision changed.
