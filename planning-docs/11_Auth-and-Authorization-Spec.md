# Authentication & Authorization Specification
## "What Should I Watch Tonight?"

| Field | Value |
|---|---|
| Document | Auth & Authorization Specification |
| Product | What Should I Watch Tonight? (WSIWT) |
| Owner | Lakshya Dharwal |
| Version | v1.0 |
| Status | Draft |
| Date | June 18, 2026 |
| Related docs | Data Model, API Spec, Engineering Standards, Technical Design, Master SOP |

> **Scope note.** The MVP is **anonymous** — no accounts, `localStorage` only. This spec defines the **Phase 5+** authentication and authorization design so accounts can be added without re-architecting. The distinction it enforces: *authentication* = "who is the user?"; *authorization* = "what is this user allowed to access?"

---

## 1. MVP state (Phases 0–4)

- No signup/login. All endpoints (`/recommend`, `/movie`, `/health`) are public and anonymous.
- Watchlist and feedback live in `localStorage`; there is no server identity.
- The endpoint layer is still written so that adding an optional `current_user` dependency later does not change existing route logic.

## 2. Production goals (Phase 5+)

- Let users create an account to sync their watchlist, feedback, and preferences across devices.
- Keep `/recommend` and `/movie` usable **anonymously** (recommendations don't require login); only user-owned data requires auth.
- Enforce that a user can only read/write **their own** data.

## 3. Authentication design

### 3.1 Methods

- **Email + password** (primary). Passwords hashed with **argon2id** (or bcrypt) — never stored or logged in plaintext.
- **OAuth (Google)** (optional, recommended) — `auth_provider = 'google'`, no local password.

### 3.2 Session mechanism

Recommended: **httpOnly, Secure, SameSite=Lax session cookies** backed by short-lived access + refresh tokens (or server sessions). Rationale: httpOnly cookies are not readable by JS, mitigating XSS token theft. If a token (JWT) approach is used instead, store it in an httpOnly cookie, not `localStorage`.

| Token | Lifetime | Storage |
|---|---|---|
| Access | ~15 min | httpOnly cookie |
| Refresh | ~7–30 days, rotating | httpOnly cookie |

### 3.3 Auth endpoints (Phase 5+)

| Method | Route | Purpose |
|---|---|---|
| POST | `/auth/signup` | Create account (email, password) → sets session |
| POST | `/auth/login` | Authenticate → sets session |
| POST | `/auth/logout` | Clear session |
| POST | `/auth/refresh` | Rotate access token |
| GET | `/auth/me` | Current user profile |
| POST | `/auth/password/forgot` | Send reset token |
| POST | `/auth/password/reset` | Reset with token |
| GET/POST | `/auth/oauth/google` | OAuth start/callback |

### 3.4 Auth rules

- Hash + verify passwords with a slow KDF (argon2id); enforce a minimum password policy.
- Rate-limit `/auth/login`, `/auth/signup`, and password-reset endpoints; apply incremental backoff / lockout on repeated failures.
- Email enumeration resistance: identical responses for "unknown email" and "wrong password."
- Reset tokens are single-use, short-lived, and stored hashed.
- Never return `password_hash` in any response.

## 4. Authorization design

### 4.1 Roles

| Role | Capabilities |
|---|---|
| `user` | CRUD on **their own** watchlist, ratings, preferences; read recommendations |
| `admin` | Manage `pacing_labels`; read aggregate analytics; no access to other users' private lists by default |

### 4.2 Resource ownership rule (the core)

Every user-scoped endpoint must verify `resource.user_id == current_user.id` **on the server**, regardless of what the client sends. Never trust a `user_id` supplied in the request body or path to grant access.

### 4.3 Endpoint protection matrix

| Route | Anonymous | Authenticated `user` | `admin` |
|---|---|---|---|
| `POST /recommend` | ✅ | ✅ | ✅ |
| `GET /movie/{id}` | ✅ | ✅ | ✅ |
| `GET /health` | ✅ | ✅ | ✅ |
| `GET/POST/DELETE /watchlist` | ❌ | ✅ own only | ✅ own only |
| `POST/DELETE /ratings` | ❌ | ✅ own only | ✅ own only |
| `GET /auth/me` | ❌ | ✅ | ✅ |
| `* /admin/pacing-labels` | ❌ | ❌ | ✅ |

Enforced via a FastAPI dependency (`get_current_user`) on protected routes and an ownership check in the service layer. Return `401` when unauthenticated, `403` when authenticated but not permitted, `404` (not `403`) when hiding the existence of another user's resource is preferable.

## 5. New user-scoped endpoints (Phase 5+)

| Method | Route | Purpose | Auth |
|---|---|---|---|
| GET | `/watchlist` | List the user's saved titles | user |
| POST | `/watchlist` | Add a title (idempotent on tmdb_id+media_type) | user |
| DELETE | `/watchlist/{tmdb_id}` | Remove a saved title | user |
| POST | `/ratings` | Upsert a thumbs verdict | user |
| DELETE | `/ratings/{tmdb_id}` | Clear a verdict | user |
| GET | `/me/preferences` | Get saved default preferences | user |
| PUT | `/me/preferences` | Update saved default preferences | user |

These map to the `watchlist_items`, `ratings`, and user preference data in the Data Model doc.

## 6. Migration from anonymous MVP

On first login, offer to **import** the visitor's `localStorage` watchlist and feedback into their account (one-time merge, de-duplicated by `tmdb_id + media_type`). After import, the account becomes the source of truth and the client syncs via the new endpoints.

## 7. Security cross-references

- Secrets (`AUTH_SECRET`, OAuth client secret) in env / secret manager only (Engineering Standards §8).
- CSRF protection for cookie-based sessions (token or SameSite + custom header) (Engineering Standards §7).
- Parameterized queries only — no SQL string building (Engineering Standards §7).
- Mandatory authorization test: an authenticated user must **not** be able to read or modify another user's watchlist/ratings (Engineering Standards §9).

## 8. Requirements impact

Adding auth resolves open decision **D5** (optional accounts) and supersedes **DEC-3** (localStorage-only) for the production phase. It introduces new FRs (account CRUD, ownership enforcement) and SRs (password hashing, CSRF, auth rate limiting) to be appended to the SRS when Phase 5 begins.

---

*Auth is deliberately out of the MVP but fully specified here. When Phase 5 starts, implement this spec alongside the production schema in the Data Model doc, add the new requirement IDs to the SRS, and log the change in the Master SOP.*
