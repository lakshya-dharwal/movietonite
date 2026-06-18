# Data Model & Database Schema
## "What Should I Watch Tonight?"

| Field | Value |
|---|---|
| Document | Data Model & Database Schema |
| Product | What Should I Watch Tonight? (WSIWT) |
| Owner | Lakshya Dharwal |
| Version | v1.0 |
| Status | Draft |
| Date | June 18, 2026 |
| Related docs | Technical Design, API Spec, Auth Spec, Engineering Standards, Master SOP |

> **Scope note.** The MVP stores no server-side data (anonymous, `localStorage` only). This document defines (a) the **MVP client-side shapes** and (b) the **production Postgres schema** introduced in Phase 5+ when accounts arrive. Designing the schema now prevents a painful retrofit later.

---

## 1. Objects in the app (the domain)

| Object | Exists in MVP? | Description |
|---|---|---|
| User | Prod only | A registered account |
| UserPreferences | MVP (transient) | One questionnaire submission (request payload) |
| Recommendation | MVP (transient) | One ranked result returned for a request |
| WatchlistItem | MVP (localStorage) → Prod (DB) | A title a user saved |
| Rating / Feedback | Prod (localStorage-light in MVP) | Thumbs up/down used for taste learning + metrics |
| RecommendationSession | Prod | A logged request + its inputs (analytics) |
| RecommendationResult | Prod | A title shown in a session (analytics) |
| TitleCache | MVP (in-memory/SQLite) → Prod (DB/Redis) | Cached enrichment per title |
| PacingLabel | Phase 3+ | Seeded/inferred pacing per title |

## 2. MVP — client-side shapes (`localStorage`)

No server persistence. Keys and shapes (mirrored in `lib/types.ts`):

```ts
// localStorage key: "wsiwt.watchlist"
type WatchlistItem = {
  tmdbId: number;
  mediaType: "movie" | "show";
  title: string;
  year: number;
  posterUrl: string | null;
  addedAt: string; // ISO
};

// localStorage key: "wsiwt.feedback"
type Feedback = {
  tmdbId: number;
  verdict: "up" | "down";
  at: string; // ISO
};

// localStorage key: "wsiwt.lastPreferences"  (prefill convenience)
type StoredPreferences = UserPreferences; // see API Spec
```

Rules: validate/parse on read (storage can be tampered with or stale); cap list sizes; namespace all keys with `wsiwt.`.

## 3. Production — Postgres schema (Phase 5+)

ER relationships:

```
users 1───∞ watchlist_items
users 1───∞ ratings
users 1───∞ recommendation_sessions
recommendation_sessions 1───∞ recommendation_results
title_cache 1───1 pacing_labels        (by tmdb_id, optional)
(watchlist_items / ratings / recommendation_results reference title_cache by tmdb_id, soft FK)
```

### 3.1 `users`

| Column | Type | Constraints |
|---|---|---|
| id | uuid | PK, default gen_random_uuid() |
| email | citext | UNIQUE, NOT NULL |
| password_hash | text | NULL (null when OAuth-only) |
| auth_provider | text | NOT NULL default 'password' (`password` \| `google`) |
| display_name | text | NULL |
| region | text | NOT NULL default 'IN' (for region-aware providers) |
| role | text | NOT NULL default 'user' (`user` \| `admin`) |
| created_at | timestamptz | NOT NULL default now() |
| updated_at | timestamptz | NOT NULL default now() |

Indexes: unique on `email`.

### 3.2 `watchlist_items`

| Column | Type | Constraints |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK → users(id) ON DELETE CASCADE, NOT NULL |
| tmdb_id | integer | NOT NULL |
| media_type | text | NOT NULL (`movie` \| `show`) |
| title | text | NOT NULL |
| year | integer | NULL |
| poster_url | text | NULL |
| added_at | timestamptz | NOT NULL default now() |

Constraints/indexes: `UNIQUE (user_id, tmdb_id, media_type)` (no duplicate saves — avoids messy duplicate data); index on `user_id`.

### 3.3 `ratings` (taste feedback)

| Column | Type | Constraints |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK → users(id) ON DELETE CASCADE, NOT NULL |
| tmdb_id | integer | NOT NULL |
| media_type | text | NOT NULL |
| verdict | smallint | NOT NULL (`1` up, `-1` down) |
| created_at | timestamptz | NOT NULL default now() |

Constraints/indexes: `UNIQUE (user_id, tmdb_id)` (one current verdict per title); index on `user_id`.

### 3.4 `recommendation_sessions` (analytics/observability)

| Column | Type | Constraints |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK → users(id) ON DELETE SET NULL, NULL (anonymous allowed) |
| preferences | jsonb | NOT NULL (the `UserPreferences` payload) |
| result_count | smallint | NOT NULL |
| latency_ms | integer | NULL |
| created_at | timestamptz | NOT NULL default now() |

Index on `created_at` (time-series queries), `user_id`.

### 3.5 `recommendation_results`

| Column | Type | Constraints |
|---|---|---|
| id | uuid | PK |
| session_id | uuid | FK → recommendation_sessions(id) ON DELETE CASCADE, NOT NULL |
| tmdb_id | integer | NOT NULL |
| rank | smallint | NOT NULL |
| composite_score | numeric(4,2) | NOT NULL |
| imdb_rating | numeric(3,1) | NULL |

Index on `session_id`.

### 3.6 `title_cache` (server-side enrichment cache)

| Column | Type | Constraints |
|---|---|---|
| tmdb_id | integer | PK (composite with media_type) |
| media_type | text | PK part |
| metadata | jsonb | NOT NULL (TMDb fields) |
| imdb_rating | numeric(3,1) | NULL |
| imdb_votes | integer | NULL |
| letterboxd_rating | numeric(2,1) | NULL |
| metacritic_score | smallint | NULL |
| providers | jsonb | NULL (region-keyed) |
| fetched_at | timestamptz | NOT NULL default now() |

Use: read-through cache with TTL based on `fetched_at` (NFR-004). In production this may be Redis instead of/in addition to this table.

### 3.7 `pacing_labels` (Phase 3+)

| Column | Type | Constraints |
|---|---|---|
| tmdb_id | integer | PK (with media_type) |
| media_type | text | PK part |
| pacing | text | NOT NULL (`slow` \| `fast`) |
| source | text | NOT NULL (`manual` \| `inferred`) |
| updated_at | timestamptz | NOT NULL default now() |

Looked up first; falls back to inferred classification (Technical Design §5.4).

## 4. Data integrity & normalization rules

- One source of truth per fact; avoid duplicate columns across tables.
- Unique constraints prevent duplicate watchlist/rating rows (the classic "messy duplicate data" problem).
- `tmdb_id + media_type` is the natural key for any title-scoped data; treat it consistently everywhere.
- Use `ON DELETE CASCADE` for user-owned data so account deletion is clean (and GDPR-friendly); `SET NULL` for analytics that should survive anonymized.
- All timestamps `timestamptz` in UTC.

## 5. Migrations

- Use a migration tool (Alembic for SQLAlchemy, or Prisma migrate if using Prisma) from the first DB commit. No manual schema edits in any environment.
- Migrations run as a deploy step; never hand-mutate production.
- Each migration is reversible where feasible and committed to Git.

## 6. Data privacy & retention

- MVP: no server PII at all.
- Production: store the minimum — email + auth + user-owned lists. Hash passwords (never store plaintext; see Auth Spec). Support account deletion (cascade). Consider anonymizing or expiring `recommendation_sessions` after a retention window.

## 7. Mapping to requirements

| Table / shape | Requirements |
|---|---|
| WatchlistItem (localStorage), watchlist_items | FR-040–FR-042 |
| Feedback / ratings | PRD §9 metrics, taste learning |
| title_cache | NFR-004 |
| pacing_labels | FR-004 (Phase 3 method) |
| users, role | Auth Spec (authz) |

---

*The MVP ships on the client-side shapes in §2. The Postgres schema in §3 is the planned Phase 5+ target; build it behind the Auth Spec rollout and never retrofit CRUD without it. Schema changes are logged in the Master SOP.*
