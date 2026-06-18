# Engineering Standards & Production-Readiness
## "What Should I Watch Tonight?" — the "real app underneath"

| Field | Value |
|---|---|
| Document | Engineering Standards & Production-Readiness |
| Product | What Should I Watch Tonight? (WSIWT) |
| Owner | Lakshya Dharwal |
| Version | v1.0 |
| Status | Draft |
| Date | June 18, 2026 |
| Related docs | SRS, Technical Design, API Spec, Data Model, Auth Spec, Master SOP |

> **Purpose.** This document is the checklist that keeps WSIWT from being "a visible app with no real app underneath." It maps every fundamental — architecture, data, auth, validation, errors, security, env, testing, deployment, scalability, version control, observability, accessibility, feedback — to a concrete standard. Each item is tagged **[MVP-now]** (do it in the localStorage MVP) or **[Prod-later]** (planned for the accounts + database phase, Phase 5+). MVP-first does not mean "skip"; it means "documented and scheduled."

---

## 0. Phase boundary

- **MVP (Phases 0–4):** anonymous, no accounts, `localStorage` only, no server-side PII. The backend still enforces secrets, validation, error handling, CORS, and basic rate limiting.
- **Production (Phase 5+):** add accounts, Postgres, CRUD, authorization, and the full security/observability/testing surface. The Data Model and Auth specs describe this path.

## 1. Architecture & where logic lives

**[MVP-now]** Two tiers, clear separation (see Technical Design): React SPA ↔ FastAPI backend. Rules:

- All business logic (scoring, floor, sort, candidate selection, conviction) lives in the **backend `services/` layer**, never in React. The frontend renders and collects input only.
- The backend is the **only** component with secrets or third-party access. The frontend talks solely to documented REST endpoints (IR-001).
- Keep clients (`tmdb`, `claude`, `ratings`, `providers`) thin and pure; orchestration lives in `services/recommend.py`.
- No logic in components beyond presentation and local UI state; shared logic goes in `hooks/` and `lib/`.

**Anti-pattern to avoid:** generating pages/components ad hoc. Every new feature decides up front: which endpoint, which service function, which data shape, which component.

## 2. Data model thinking

**[MVP-now]** Even with no database, name the objects: `UserPreferences`, `Recommendation`, `WatchlistItem`. They are defined once (API Spec / Data Model) and mirrored in `lib/types.ts`. Never invent ad-hoc shapes per component.

**[Prod-later]** Full entities, relationships, indexes, and migrations are in the **Data Model & Database Schema** doc (users, watchlist_items, ratings, recommendation_sessions, title_cache, pacing_labels). Design the schema before writing CRUD.

## 3. Authentication vs authorization

**[MVP-now]** No accounts; all endpoints are anonymous. Document the boundary so it isn't bolted on carelessly later.

**[Prod-later]** Full flow in the **Auth & Authorization** spec. Core rule to internalize now: *authentication* answers "who is the user?"; *authorization* answers "what may this user touch?" Every user-scoped endpoint must verify the caller owns the resource (e.g., a user may only read/modify their own watchlist), enforced in the backend, never assumed from the client.

## 4. Input validation

**[MVP-now]** Trust nothing from the client. Standards:

- Validate every request body with **Pydantic** models; reject unknown/oversized payloads.
- Enforce enums (`mood`, `time`, `media_type`, `sort_by`, `origin`, `pacing`) and bounds (`min_rating` 0–10, `genres` ≤ 3) at the model layer (FR-002).
- Validate again at the service boundary for anything not expressible in the schema.
- Sanitize free-text (`recent_loves`) before it is interpolated into a Claude prompt (prompt-injection awareness): treat it as data, cap length, strip control characters.
- Frontend validation is for UX only; it is never the security boundary.

## 5. Error handling

**[MVP-now]** Use the consistent error envelope from the API Spec (§6): `{ error: { code, message, detail } }` with mapped HTTP codes (`INVALID_REQUEST`, `VALIDATION_ERROR`, `RATE_LIMITED`, `UPSTREAM_FAILURE`, `UPSTREAM_TIMEOUT`, `INTERNAL_ERROR`). Standards:

- Wrap every third-party call with timeout + try/except; convert failures to the envelope or to graceful `null` (NFR-005).
- Partial enrichment returns `200` with `null` fields, never a hard error (FR-014).
- Never leak stack traces or upstream error text to the client; log them server-side instead.
- The Claude JSON parser must survive fences/garbage and never crash a request (FR-011).

## 6. Loading, empty & edge states

**[MVP-now]** Every network-bound screen ships three non-happy states (UX Spec §10): **loading** (skeleton shimmer), **empty** ("no titles cleared the floor" + lower-the-floor action), and **error** (inline retry). Plus: missing rating source (hide chip), no streaming data (region caveat). **[Prod-later]** add "session expired," "you don't have permission," "upload failed" once auth exists.

## 7. Security basics

**[MVP-now]**

- **Secrets:** TMDb / Anthropic / RapidAPI keys only in backend env; never in client code, never committed (SR-001). See §9.
- **CORS:** restrict to the deployed frontend origin; no wildcard in production.
- **Rate limiting:** basic per-IP limit on `/recommend` to prevent API-cost abuse and scraping amplification.
- **XSS:** React escapes by default; never use `dangerouslySetInnerHTML` with model/scraped text.
- **Injection:** no raw SQL in the MVP (no DB). When the DB lands, use the ORM/parameterized queries only — never string-build SQL.
- **Scraping hygiene:** backoff, caching, respect robots/rate limits (SR-003).
- **Transport:** HTTPS only in production.

**[Prod-later]**

- Password hashing (argon2/bcrypt), CSRF protection for cookie sessions, secure/httpOnly/SameSite cookies, auth-endpoint rate limiting, account lockout/backoff, and dependency vulnerability scanning. (Detail in Auth Spec.)
- No unsafe file uploads (none planned; if added, validate type/size, store off-origin).

## 8. Environment & configuration

**[MVP-now]** All config via environment variables; nothing hardcoded. Provide a committed **`.env.example`** (no real values) and keep `.env` git-ignored.

```
# backend/.env
TMDB_API_KEY=
ANTHROPIC_API_KEY=
RAPIDAPI_KEY=
ALLOWED_ORIGIN=http://localhost:5173
CACHE_BACKEND=memory        # memory | sqlite | redis
CACHE_TTL_SECONDS=86400
RATE_LIMIT_PER_MIN=30
# frontend/.env
VITE_API_BASE_URL=http://localhost:8000
```

**[Prod-later]** add `DATABASE_URL`, `AUTH_SECRET`/`JWT_SECRET`, `SESSION_COOKIE_*`, OAuth client id/secret, `SENTRY_DSN`. Store production secrets in the platform's secret manager, not in files.

## 9. Testing

**[MVP-now]** Minimum viable test suite (see Master SOP Appendix B):

- **Unit:** `composite_score` (weighting + renormalization with missing sources), `badge` thresholds, floor filter, sort order, Claude JSON parser (T-001…T-005).
- **Contract:** `/recommend` and `/movie` responses conform to the API Spec schema (T-006).
- **Integration:** missing ratings/providers → `null`, still `200` (T-007); watchlist persists across reload (T-009).
- **Manual/UX:** questionnaire under ~60s (T-008), mobile usable (T-010).

**[Prod-later]** auth tests are mandatory: can a user sign up/log in? can they save data? **can an unauthorized user reach another user's private data?** (the highest-value security test). Add e2e (Playwright) for the core journey and weird-input fuzzing on every route.

Run tests in CI on every push before deploy.

## 10. Deployment reality

**[MVP-now]** "Works on localhost" ≠ production. Checklist:

- Frontend build (`vite build`) deployed to static host (Vercel); backend to GCP Cloud Run.
- CORS set to the real frontend domain; HTTPS enforced; environment variables set in the platform.
- Health check (`/health`) wired to the platform liveness probe.
- Logs accessible; a rollback path exists (previous image/deploy).

**[Prod-later]** database migrations run as a deploy step (no manual schema edits), connection pooling configured, backups scheduled, zero-downtime deploy considered.

## 11. Scalability basics

**[MVP-now]** Not "millions of users" — just no dumb bottlenecks:

- Async-parallel per-candidate fetches (already designed); avoid sequential awaits.
- Title-keyed caching to kill repeated TMDb/scrape calls (NFR-004).
- Cap candidate count (5–8) and result count (3–5) to bound work per request.
- Serve appropriately sized poster images (TMDb width variants), not full-res.
- Keep responses lean — only the `Recommendation` fields the UI needs.

**[Prod-later]** add DB indexes (see Data Model), avoid N+1 queries, paginate any list endpoint, consider a CDN for images.

## 12. Version control hygiene

**[MVP-now]**

- Git from commit #1; `.gitignore` covers `.env`, `node_modules`, build output, `__pycache__`.
- Small, frequent commits with clear messages (Conventional Commits: `feat:`, `fix:`, `chore:`). One logical change per commit.
- Branch per feature/phase; merge via PR (even solo — it creates review + rollback points).
- Never "ask AI to rewrite the whole file" without a clean commit first, so any bad change is one `git revert` away.
- Tag milestones (`v0.1-mvp`).

## 13. Observability

**[MVP-now]**

- Structured backend logging (request id, route, latency, upstream timings, outcome) — no secrets or PII in logs.
- Log every upstream failure and parse fallback so you can see *why* a recommendation degraded.
- Frontend: log fetch errors to the console and a lightweight error boundary.

**[Prod-later]** error tracking (Sentry), basic analytics on the success metrics (time-to-results, helpful-pick rate, watchlist adds), and uptime/latency monitoring with alerts.

## 14. Accessibility

**[MVP-now]** Per UX Spec §11: WCAG AA contrast on the near-black theme, full keyboard navigation, visible emerald focus ring, semantic HTML + labels on all form controls, alt text on posters, ≥44px touch targets, and `prefers-reduced-motion` support. Accessibility is a requirement (NFR), not a nicety.

## 15. User feedback loops

**[MVP-now]** Build the thumbs-up/down on result cards early — it is both the taste-learning signal and the core product-validation metric ("helpful pick" rate, PRD §9). Test with the three personas; iterate on the questionnaire and ranking based on real picks, not vibes.

---

## Production-Readiness Checklist (sign-off gate)

| # | Item | Tag | Done? |
|---|---|---|---|
| 1 | Clear user problem & flow documented | MVP | ✅ (PRD, UX) |
| 2 | Logic in backend services, not components | MVP | ☐ |
| 3 | Data objects named & typed once | MVP | ☐ |
| 4 | Every route validates input (Pydantic + bounds) | MVP | ☐ |
| 5 | Consistent error envelope; graceful degradation | MVP | ☐ |
| 6 | Loading / empty / error states on every screen | MVP | ☐ |
| 7 | Secrets in env; `.env.example` committed; `.env` ignored | MVP | ☐ |
| 8 | CORS locked; rate limit on `/recommend`; HTTPS | MVP | ☐ |
| 9 | Unit + contract + integration tests passing in CI | MVP | ☐ |
| 10 | Deployed with env config, health check, logs, rollback | MVP | ☐ |
| 11 | Caching + async parallel; no obvious bottlenecks | MVP | ☐ |
| 12 | Git hygiene: branches, small commits, tags | MVP | ☐ |
| 13 | Structured logging; upstream failures visible | MVP | ☐ |
| 14 | Accessibility (AA contrast, keyboard, labels, alt, reduced-motion) | MVP | ☐ |
| 15 | Thumbs feedback shipped; persona testing done | MVP | ☐ |
| 16 | Accounts + sessions + password hashing | Prod | ☐ |
| 17 | Authorization: users can only access their own data (tested) | Prod | ☐ |
| 18 | Postgres schema + migrations + backups | Prod | ☐ |
| 19 | CSRF / secure cookies / auth rate limiting | Prod | ☐ |
| 20 | Error tracking + analytics + uptime monitoring | Prod | ☐ |

*Treat the MVP rows as the launch gate for the public MVP; the Prod rows gate the accounts/database release. Update this table as items are completed and log status changes in the Master SOP.*
