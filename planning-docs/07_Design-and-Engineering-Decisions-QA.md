# Design & Engineering Decisions (Q&A)
## "What Should I Watch Tonight?" — The questions you answer before building

| Field | Value |
|---|---|
| Document | Design & Engineering Decisions (Q&A) |
| Product | What Should I Watch Tonight? (WSIWT) |
| Owner | Lakshya Dharwal |
| Version | v1.0 |
| Status | Draft |
| Date | June 17, 2026 |
| Purpose | The full set of product, design, and coding questions one should resolve before writing a web app, answered for this project. Open items are flagged. |

---

## How to read this

Each question is a decision a team traditionally settles before design and coding begin. Answers reflect the decisions captured across the project plan, concept document, and the design direction chosen on June 17, 2026. Items marked **OPEN** still need a call.

---

## A. Product & Scope Questions

**A1. What problem are we solving, in one sentence?**
Decision fatigue: get a user from "I have two hours" to a genuinely worth-it pick in under a minute, with the best-rated titles first.

**A2. Who is the user?**
Three personas — "the Decider" (fast trustworthy shortlist), "the Mood Viewer" (knows the feeling not the title), and "the Regional Viewer" (wants accurate Indian-language picks and availability). See PRD §4.

**A3. What is the single differentiator we will not compromise?**
Rating-first sorting with a quality floor — the best composite rating always surfaces first, nothing mediocre. Everything else is secondary to this.

**A4. What's explicitly out of scope for the MVP?**
Accounts/auth, video/trailer hosting, social features, native apps, monetization. (PRD §6.2)

**A5. What does "done" mean for the MVP?**
Questionnaire under ~60s; 3–5 ranked picks best-first above the floor; cards with IMDb-primary ratings + synopsis + why-you'll-love-it + where to stream; watchlist persists; works on mobile.

**A6. How do we measure success?**
Time-to-results, "helpful pick" rate, watchlist adds, and 7-day return usage. (PRD §9)

## B. Design Questions

**B1. What is the overall visual vibe?**
**Sophisticated minimalism × cinematic dark mode** — near-black, high-contrast, image-first, minimal-UI, single-accent, generous-spacing, card-based modular layout with aggressive type hierarchy. (UX Spec §1–2)

**B2. What is the accent / palette direction?**
**Emerald / teal** (`#2FD3A5`) as the single interactive accent — used for actions, links, and rating numerals — over near-black neutrals (`#0F0F0F`) with near-white text. Gold is reserved exclusively for the MASTERPIECE badge. No other colors. (UX Spec §3)

**B3. What is the typography personality?**
**Sans-first.** Inter for all body/UI/card titles (titles bold); a display serif (Fraunces) **reserved for headlines only** (landing hero, step questions); monospace (JetBrains Mono) for rating numerals. Hierarchy is aggressive — big bold headlines, small quiet metadata, no middle sizes. (UX Spec §4)

**B4. What is the shape, surface, and motion language?**
**Rounded ~10px** cards (sheets 16px, pill buttons), **image-first** (poster fills 40–60% of a card), **flat with subtle shadows** (no glassmorphism), ~1.5rem (24px) gaps with generous negative space, and **restrained functional motion** (quick step crossfade, ~1.02 hover scale, simple fade-ins, skeleton loads — no parallax or theatrical animation). Motion never gates content. Layout uses progressive disclosure, oversized accent CTAs, and horizontal carousels. (UX Spec §5–8)

**B5. Mobile-first or desktop-first?**
Mobile-first, scaled up. Designed for a phone in a dark room.

**B6. What is the hero component and what must it always show?**
The MovieCard. It must always foreground the IMDb-primary rating + quality badge, the why-you'll-love-it / convince-you text, and where to stream. (UX Spec §8.3)

**B7. How do we present the questionnaire?**
One question per screen, calm conversational pacing, large rounded selectable chips, emerald selection states, thin emerald progress bar; conditional steps (sub-genre, pacing, origin) appear only when relevant.

**B8. How do we handle empty / missing / error states?**
Skeleton shimmer loads (no spinners), a friendly "lower the floor" suggestion on empty, graceful hiding of missing rating chips, region caveats for unknown availability, inline retry on errors. (UX Spec §10)

**B9. Accessibility commitments?**
WCAG AA contrast, never color-alone for state, full keyboard nav with a visible emerald focus ring, `prefers-reduced-motion` fallback, ≥44px touch targets. (UX Spec §11)

**B10. OPEN — Logo, name lockup, and favicon?**
Working title is "What Should I Watch Tonight?" A final wordmark/lockup in the display serif is not yet designed.

## C. Architecture & Engineering Questions

**C1. What is the system shape?**
React SPA frontend + FastAPI backend. The backend holds all secrets and is the only thing that talks to third parties. (TDD §1)

**C2. What is the tech stack and why?**
React + TS + Tailwind + shadcn/ui (typed, component-driven, fast theming); FastAPI (native async for parallel third-party fetches, Pydantic validation); Claude API (title selection + conviction); TMDb (metadata/providers); RapidAPI/scrape for IMDb/Letterboxd/Metacritic; JustWatch for availability. (TDD §2)

**C3. What are the canonical data models?**
`UserPreferences` (request) and `Recommendation` (response), defined once in the API Spec and TDD and mirrored in the frontend `types.ts`.

**C4. What endpoints exist?**
`POST /recommend`, `GET /movie/{tmdb_id}`, `GET /health`. (API Spec)

**C5. How is the core ranking computed?**
Composite score = IMDb 0.5 / Letterboxd 0.3 / Metacritic 0.2, normalized to /10 and renormalized over available sources; filter by `min_rating` (default 7.5); sort composite desc, IMDb votes as tie-break. (TDD §5)

**C6. How does the AI integration work and how do we keep it reliable?**
Two Claude prompts (title selection; conviction + love-match), both instructed to return JSON only and parsed defensively (strip fences, try/except). Conviction is batched and concurrent; failures degrade gracefully. (TDD §6)

**C7. How do we keep latency acceptable?**
All per-candidate enrichment runs async in parallel; results cached by title; conviction batched. Target p75 < 8s. (NFR-001, TDD §10)

**C8. How do we handle missing third-party data?**
Every rating source and provider list is optional; missing data becomes `null`, never an error, and the card still renders. (FR-014, NFR-005)

**C9. Where do secrets live?**
Backend environment only; never shipped to the client; all third-party calls proxied through the backend. (SR-001, SR-002)

**C10. What is the storage plan?**
MVP is client-side `localStorage` (preferences + watchlist), no server PII. A server store (Firebase/Postgres) is a later decision tied to accounts. (TDD §2, SR-004)

**C11. What is the caching backend?**
**OPEN** — Redis (managed, multi-instance) vs. SQLite/in-memory (single instance) for the first deploy. (TDD §11)

**C12. How do we infer pacing?**
Phased: runtime heuristic → review-text classification via Claude → seeded manual labels for top titles; always labeled "inferred." (TDD §5.4)

**C13. How is it deployed?**
Backend on GCP Cloud Run, frontend on Vercel/static host; local-first during dev. (TDD §9)

**C14. What's our error contract?**
Consistent error envelope with codes (`INVALID_REQUEST`, `RATE_LIMITED`, `UPSTREAM_FAILURE`, `UPSTREAM_TIMEOUT`, `INTERNAL_ERROR`); partial enrichment still returns 200. (API Spec §6)

## D. Quality, Testing & Ops Questions

**D1. What do we test first?**
The scoring/badge/floor/sort logic (pure functions, easy unit tests) and the defensive Claude JSON parser.

**D2. How do we verify the differentiator holds?**
A test asserting results are always sorted best-composite-first and never below the active floor. (FR-017, FR-018)

**D3. How do we handle scraping fragility?**
Cache aggressively, back off on rate limits, treat any failure as missing data. (SR-003)

**D4. OPEN — Which RapidAPI IMDb endpoint do we standardize on?**
Cost vs. coverage trade-off not yet decided. (PRD §12)

**D5. OPEN — Do we add optional accounts in the MVP, or stay fully anonymous?**
Not yet decided; affects storage and sync. (PRD §12)

**D6. OPEN — Do we embed trailers in the MVP or only in the detail modal?**
Not yet decided. (PRD §12)

---

## Open Decisions Summary

| ID | Question | Owner | Status |
|---|---|---|---|
| B10 | Final wordmark / logo / favicon | Lakshya | Open |
| C11 | Cache backend (Redis vs. SQLite) | Lakshya | Open |
| D4 | RapidAPI IMDb endpoint choice | Lakshya | Open |
| D5 | Optional accounts in MVP? | Lakshya | Open |
| D6 | Trailers in MVP? | Lakshya | Open |

*Resolve open items before the sprint that depends on them; record each resolution in the Master SOP change log and decision log.*
