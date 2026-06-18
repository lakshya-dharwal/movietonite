# Standard Operating Procedure (Master Tracking Document)

```
SOP Title:    What Should I Watch Tonight? — Design History & Master SOP
SOP ID:       SOP-WSIWT-001
Version:      v1.0
Author:       Lakshya Dharwal
Status:       Draft
Date:         June 17, 2026
Last Updated: June 18, 2026
Project Type: Software Tool / Web App (AI-assisted)
```

> **This is the master tracking document.** It governs and links every other
> planning document for the project and holds the single source of truth for
> requirements traceability, decisions, risks, and change history. When any
> linked document changes, the change is recorded here (Appendix G).

---

## Recent Updates

- **June 18, 2026 — Foundation docs added (current).** Added Engineering Standards & Production-Readiness (09), Data Model & Database Schema (10), and Auth & Authorization Spec (11), plus a root `CLAUDE.md` entry point for Claude Code. Scope confirmed: **MVP-first** (anonymous, localStorage) with the full production path (accounts/Postgres/auth/security/testing) documented for Phase 5+.
- **June 18, 2026 — Design language revised.** Adopted "Sophisticated Minimalism × Cinematic Dark Mode." Background deepened to `#0F0F0F`; typography moved to **sans-first with serif headlines**; effects made **flat/restrained** (glassmorphism and rich motion dropped). Accent **kept emerald/teal**. UX Spec bumped to v1.1; build prompt, decisions Q&A, and README updated.
- June 17, 2026 — Project documentation set established. Created the full pre-build document set: PRD, SRS, Technical Design, API Spec, UX/UI Design Spec, Roadmap & Backlog, Decisions Q&A, and AI Build Prompt.
- June 17, 2026 — Tech stack and core algorithms (composite score, rating floor, badge) confirmed from the project plan and concept document.

---

## 1. Document Control

| Item | Value |
|---|---|
| Document ID | SOP-WSIWT-001 |
| Version | v1.0 |
| Author | Lakshya Dharwal |
| Status | Draft |
| Date created | June 17, 2026 |
| Last updated | June 17, 2026 |

### Linked documents (the project document set)

| # | Document | File | Purpose |
|---|---|---|---|
| 00 | Master SOP (this doc) | `00_MASTER-SOP_...md` | Tracks everything: traceability, decisions, risks, changes |
| 01 | PRD | `01_PRD_...md` | Product vision, problem, personas, scope, metrics |
| 02 | SRS | `02_SRS_...md` | Functional, non-functional, constraint requirements with IDs |
| 03 | Technical Design | `03_Technical-Design-Architecture.md` | Architecture, data models, algorithms, deployment, security |
| 04 | API Spec | `04_API-Specification.md` | Endpoint contracts and data schemas |
| 05 | UX/UI Design Spec | `05_UX-UI-Design-Spec-and-Design-System.md` | User flows, design system, components |
| 06 | Roadmap & Backlog | `06_Project-Roadmap-and-Sprint-Backlog.md` | Phases, milestones, sprint stories, estimates |
| 07 | Decisions Q&A | `07_Design-and-Engineering-Decisions-QA.md` | Pre-build product/design/coding decisions, open items |
| 08 | AI Build Prompt | `08_AI-Build-Prompt.md` | Ready-to-paste prompt to build the app |
| 09 | Engineering Standards & Production-Readiness | `09_Engineering-Standards-and-Production-Readiness.md` | Full fundamentals checklist (architecture, validation, security, testing, deploy, observability, a11y, git), MVP-now vs Prod-later |
| 10 | Data Model & Database Schema | `10_Data-Model-and-Database-Schema.md` | MVP localStorage shapes + production Postgres schema |
| 11 | Auth & Authorization Spec | `11_Auth-and-Authorization-Spec.md` | AuthN/AuthZ design for Phase 5+ |
| — | CLAUDE.md (repo root) | `../CLAUDE.md` | Claude Code entry point: rules, doc index, scope boundary, DoD |

## 2. Purpose

This SOP is intended to document the design, requirements, decisions, and build process for the WSIWT web application, and to serve as the central tracking record that links all project documents and maintains traceability from user needs through requirements, design, and test.

## 3. Scope

This SOP covers the product definition, software requirements, system architecture, design system, development phases, verification and validation approach, risk management, and change control for the MVP and its near-term phases (Phases 0–4). It does not cover post-launch operations at scale, which will be addressed in a later revision.

## 4. Intended Use

The WSIWT application is intended to help users choose a movie or show to watch by returning a short list of best-rated, preference-matched recommendations with transparent ratings and persuasive, taste-aware explanations.

> This software is intended for general consumer, prototype, portfolio, and
> educational use only. It is not a clinical, safety-critical, or financial
> system. Recommendations and streaming-availability data are informational and
> may be inaccurate or out of date.

## 5. Intended Users

End users seeking watch recommendations (the "Decider," "Mood Viewer," and "Regional Viewer" personas in the PRD). The development and maintenance audience is the project author and any future contributors.

## 6. Definitions and Abbreviations

| Term | Meaning |
|---|---|
| WSIWT | "What Should I Watch Tonight?" (this product) |
| Composite score | IMDb-weighted, multi-source quality score normalized to /10 |
| Rating floor | Minimum IMDb rating for a title to be returned (default 7.5) |
| Conviction layer | AI-generated persuasion paragraph per title |
| Candidate | A title proposed by Claude before enrichment |
| TMDb | The Movie Database (metadata + watch providers) |
| SPA | Single-page application |
| TTL | Time to live (cache) |

## 7. Roles and Responsibilities

| Role | Responsibility |
|---|---|
| Product owner / developer (Lakshya Dharwal) | Owns all decisions, requirements, design, build, and this SOP |
| AI coding agent | Implements phases per the AI Build Prompt under the developer's review |
| Reviewer (self/peer) | Verifies each phase meets its requirements before sign-off |

## 8. Project Overview

WSIWT is a rating-first movie & TV recommendation web app. A user completes a short layered questionnaire; the backend asks Claude for candidate titles, enriches each with TMDb metadata and multi-source ratings, computes a composite score, filters by a quality floor, sorts best-first, and returns 3–5 ranked picks with transparent ratings and AI-written "why you'll love it" and "convince you" text. The stack is React + TypeScript (frontend) and FastAPI (backend), with TMDb, the Claude API, IMDb/Letterboxd/Metacritic ratings, and JustWatch for availability. See the PRD and Technical Design for detail.

## 9. User Needs

| Need ID | User need | Source persona |
|---|---|---|
| UN-1 | Quickly get a few trustworthy, well-rated picks without endless scrolling | Decider |
| UN-2 | Translate a mood and time budget into concrete titles | Mood Viewer |
| UN-3 | See transparent ratings and a reason a title is worth watching | Decider |
| UN-4 | Get accurate Indian-language recommendations and where to stream them | Regional Viewer |
| UN-5 | Save titles to return to later | All |

## 10. Software Requirements

Full requirements live in the **SRS**. Summary of identifiers maintained here for traceability:

- **Functional (FR-001 … FR-042):** preference capture, recommendation generation, results presentation, watchlist.
- **Non-functional (NFR-001 … NFR-008):** performance (<8s p75), ~60s questionnaire, mobile-first, caching, graceful degradation, loading/error states, dark theme, retry/backoff.
- **Constraint / Security (SR-001 … SR-005, IR-001 … IR-002):** keys backend-only, proxied calls, respectful scraping, no server PII, region-aware availability, REST-only interface, schema conformance.

## 11. System Architecture

Two-tier: React SPA + FastAPI backend; the backend is the sole holder of secrets and the only component calling third parties. Per-candidate enrichment runs async in parallel and is cached by title. Full diagram, module breakdown, and data models are in the **Technical Design Document**.

## 12. Data Management Procedure

The MVP stores no server-side personal data. User preferences and the watchlist persist only in browser `localStorage`. Third-party data (TMDb metadata, ratings, providers) is fetched on demand and cached by title with a TTL; missing data is recorded as `null`. Source licensing and rate limits are respected; scraping uses backoff and caching (SR-003).

## 13. AI/ML Procedure

The product uses the Anthropic Claude API (not a self-trained model). Two prompts: (1) title selection — preferences in, 5–8 candidate titles out; (2) conviction + love-match — per title, ratings/taste in, two short paragraphs out. Both are instructed to return JSON only and are parsed defensively. Outputs are non-deterministic; the system never depends on a specific phrasing and degrades gracefully if a call fails. There is no training dataset, no model weights, and no bias-validation pipeline because no model is trained in-house; prompt behavior is reviewed manually.

## 14. Software Development Procedure

Development follows the phased plan in the **Roadmap & Backlog** (Phases 0–4), implemented via the **AI Build Prompt** one phase at a time, each verified before the next. Frontend and backend are separate apps with a shared, documented REST contract. Version control is Git.

## 15. Verification Procedure

Verification ("did we build it right?") focuses on unit tests for the pure scoring logic (`composite_score`, `badge`, floor, sort), the defensive Claude JSON parser, and contract conformance of `/recommend` and `/movie` against the API Spec. Each sprint story is checked against its traced requirement ID before being marked done.

## 16. Validation Procedure

Validation ("did we build the right thing?") is measured against the MVP Definition of Done and the success metrics: questionnaire under ~60s, 3–5 ranked best-first picks above the floor, transparent IMDb-primary cards with reasons and streaming, persistent watchlist, mobile usability. Validation is by manual end-to-end runs across the three personas plus the success-metric targets in the PRD.

## 17. Risk Management Procedure

| Risk ID | Hazard | Cause | Effect | Severity | Probability | Control |
|---|---|---|---|---|---|---|
| R-001 | Ratings gaps | No official IMDb/Letterboxd API | Weakens core differentiator | High | Medium | Cache, use RapidAPI, degrade to IMDb-only composite |
| R-002 | Scraping breakage | Source HTML changes / rate limits | Missing ratings, failures | Medium | High | Backoff, cache, treat missing as null |
| R-003 | Wrong availability | Provider data inaccuracy (esp. India) | User can't find the title | Medium | Medium | TMDb + JustWatch reconcile, region note |
| R-004 | Slow results | Per-title Claude latency | Breaks 60s/8s promise | Medium | Medium | Batch conviction, async parallel, cache |
| R-005 | Subjective pacing | "Fast/slow" is opinion | User disagrees with label | Low | High | Heuristic → review classification, label "inferred" |
| R-006 | Key exposure | Secrets leaked to client | Abuse / cost | High | Low | Keys backend-only, proxied calls (SR-001/002) |

## 18. Cybersecurity and Privacy Procedure

All third-party credentials reside only in backend environment configuration and are never shipped to the client. All external calls are proxied through the backend. CORS is restricted to the deployed frontend origin. No personal data is stored server-side in the MVP; preferences and watchlist remain in the user's browser. (SR-001, SR-002, SR-004)

## 19. Change Control Procedure

Any change to a requirement, the API contract, the data models, or the design direction shall be logged in Appendix G with a CHG ID, date, description, and the documents affected. Breaking API changes require a new version prefix. The author approves all changes.

## 20. Version Control Procedure

Source code and all planning documents are versioned in Git. This SOP carries a semantic version; the linked documents share the same `v1.0` baseline. Document versions are bumped when their content materially changes, with the change noted here.

## 21. Deployment / Installation Procedure

Local-first during development (Vite dev server + `uvicorn`). Production deploys the backend to GCP Cloud Run and the frontend to a static host (Vercel). Environment configuration supplies `TMDB_API_KEY`, `ANTHROPIC_API_KEY`, `RAPIDAPI_KEY`, cache settings, and the allowed CORS origin. See Technical Design §9.

## 22. User Operation Procedure

The user opens the app, answers the questionnaire (mood, time, media type, genre, and optional layered steps), submits, reviews the ranked recommendations, optionally re-sorts or adjusts the rating floor, saves titles to the watchlist, and opens the detail view for more information.

## 23. Maintenance Procedure

Maintenance focuses on keeping scrapers and provider mappings current (the most fragile dependencies), refreshing seeded pacing labels, monitoring third-party rate limits and costs, and updating the cache strategy as traffic grows. Document any maintenance change in the change log.

## 24. Known Limitations

- Ratings and availability depend on third-party sources that may be missing, rate-limited, or inaccurate.
- Pacing is inferred and labeled as such; it is not authoritative.
- No accounts or cross-device sync in the MVP; the watchlist is per-browser.
- AI text is non-deterministic and may occasionally be generic; it never blocks a result.
- Streaming availability is region-sensitive and may lag real-world changes.

## 25. References

- Project Plan — "What Should I Watch Tonight?" Coding Project Plan
- Concept & Design Document (PDF, generated June 17, 2026)
- TMDb API, Anthropic Claude API, JustWatch, IMDb, Letterboxd, Metacritic
- Project document set 01–08 (listed in Section 1)

## 26. Appendices

### Appendix A — Requirements Index

| Class | IDs | Location |
|---|---|---|
| Functional | FR-001 … FR-042 | SRS §3 |
| Non-functional | NFR-001 … NFR-008 | SRS §4 |
| Constraint/Security | SR-001 … SR-005, IR-001 … IR-002 | SRS §5 |

### Appendix B — Test Plan (initial)

| Test ID | Verifies | Type |
|---|---|---|
| T-001 | `composite_score` weighting + renormalization with missing sources | Unit |
| T-002 | `badge` thresholds | Unit |
| T-003 | Floor filter drops sub-threshold titles | Unit |
| T-004 | Sort is composite desc, votes tie-break | Unit |
| T-005 | Claude JSON parser strips fences and survives bad output | Unit |
| T-006 | `/recommend` returns schema-conformant `Recommendation[]` | Contract |
| T-007 | Missing ratings/providers return `null`, still 200 | Integration |
| T-008 | Questionnaire completable under ~60s | Manual/UX |
| T-009 | Watchlist persists across reload | Integration |
| T-010 | Mobile layout usable | Manual/UX |

### Appendix C — Risk Analysis

See Section 17 (R-001 … R-006).

### Appendix D — Traceability Matrix

| User Need | Requirement(s) | Module / File | Test ID | Status |
|---|---|---|---|---|
| UN-1 | FR-010, FR-018, FR-019 | services/recommend.py, services/scoring.py | T-003, T-004, T-006 | Planned |
| UN-2 | FR-001–FR-006 | components/Questionnaire/* | T-008 | Planned |
| UN-3 | FR-015, FR-016, FR-020, FR-030 | services/scoring.py, clients/claude.py, MovieCard | T-001, T-002, T-005 | Planned |
| UN-4 | FR-005, FR-035, SR-005 | clients/providers.py, OriginStep | T-007 | Planned |
| UN-5 | FR-040–FR-042 | hooks/useWatchlist.ts | T-009 | Planned |

### Appendix E — Decision Log

| ID | Decision | Date | Rationale |
|---|---|---|---|
| DEC-1 | Rating-first sort + 7.5 floor is the non-negotiable core | 2026-06-17 | The product's whole differentiator |
| DEC-2 | React + FastAPI stack | 2026-06-17 | Typed frontend, async backend for parallel fetch |
| DEC-3 | localStorage-only storage for MVP (no auth) | 2026-06-17 | Ship faster, no PII to manage |
| DEC-4 | Design direction: sophisticated minimalism × cinematic dark mode — near-black #0F0F0F, emerald accent, sans-first with serif headlines, image-first 10px cards, flat subtle shadows, restrained motion | 2026-06-18 | Owner-supplied design language (supersedes the earlier minimal-noir/glass/rich-motion direction); accent emerald retained |
| DEC-5 | Claude returns JSON only, parsed defensively | 2026-06-17 | Reliability against non-deterministic output |

### Appendix F — Open Decisions

| ID | Question | Status |
|---|---|---|
| B10 | Final wordmark / logo / favicon | Open |
| C11 | Cache backend (Redis vs. SQLite) | Open |
| D4 | RapidAPI IMDb endpoint choice | Open |
| D5 | Optional accounts in MVP? | Open |
| D6 | Trailers in MVP? | Open |

### Appendix G — Change Log

| CHG ID | Date | Change | Documents affected |
|---|---|---|---|
| CHG-001 | 2026-06-17 | Initial project document set created (00–08); baseline v1.0 | All |
| CHG-002 | 2026-06-17 | Design direction locked (minimal noir / emerald / editorial / glass / motion) | 05, 07, 00 |
| CHG-003 | 2026-06-18 | Design language revised to "Sophisticated Minimalism × Cinematic Dark Mode": bg #0F0F0F, sans-first + serif headlines, flat/restrained effects (glass & rich motion dropped), emerald accent kept. UX Spec → v1.1 | 05, 07, 08, README, 00 |
| CHG-004 | 2026-06-18 | Added foundation docs (09 Engineering Standards, 10 Data Model, 11 Auth) + root CLAUDE.md. Scope set to MVP-first with documented Phase 5+ production path. D5 (accounts) now has a planned design | 09, 10, 11, CLAUDE.md, README, 00 |

---

*Maintenance note: update Recent Updates, the relevant appendix, and the change log whenever any linked document changes. This SOP is the entry point to the whole project.*
