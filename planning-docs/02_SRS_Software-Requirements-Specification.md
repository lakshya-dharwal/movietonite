# Software Requirements Specification (SRS)
## "What Should I Watch Tonight?"

| Field | Value |
|---|---|
| Document | Software Requirements Specification |
| Product | What Should I Watch Tonight? (WSIWT) |
| Owner | Lakshya Dharwal |
| Version | v1.0 |
| Status | Draft |
| Date | June 17, 2026 |
| Related docs | PRD, Technical Design, API Spec, Master SOP (Appendix D traceability) |

---

## 1. Purpose

This document specifies the functional, non-functional, interface, and constraint requirements for the WSIWT web application. Each requirement is uniquely identified and testable so it can be traced to a design element and a test case (see Master SOP, Appendix D).

## 2. Definitions

| Term | Meaning |
|---|---|
| Composite score | Quality score combining IMDb, Letterboxd, and Metacritic, weighted toward IMDb, normalized to /10 |
| Rating floor | Minimum IMDb rating a title must meet to be returned (default 7.5) |
| Conviction layer | AI-generated paragraph persuading the user to watch a title |
| Candidate | A title proposed by the Claude title-selection step before enrichment |
| Provider | A streaming/rent/buy service where a title is available |

## 3. Functional Requirements

### 3.1 Preference capture

| ID | Requirement |
|---|---|
| FR-001 | The system shall present a multi-step questionnaire capturing mood, available time, media type, and genre. |
| FR-002 | The system shall let the user select up to three genres. |
| FR-003 | The system shall present a sub-genre step conditional on the selected genre (e.g., Horror → psychological, slasher, supernatural, folk, etc.). |
| FR-004 | The system shall capture a pacing preference (slow, fast, any). |
| FR-005 | The system shall capture content origin (global, Indian, both, any) and, when Indian content is selected, an Indian-language picker (Hindi, Tamil, Telugu, Kannada, Malayalam, Punjabi, Marathi, Bengali, plus Web Series). |
| FR-006 | The system shall let the user enter free-text examples of recently loved titles for personalization. |
| FR-007 | The system shall allow the user to submit the questionnaire at the end of the MVP-required steps without completing optional layered steps. |

### 3.2 Recommendation generation

| ID | Requirement |
|---|---|
| FR-010 | On submission, the system shall request 5–8 candidate titles from the Claude API, biased toward well-rated titles matching the stated preferences. |
| FR-011 | The system shall parse the Claude response as JSON only, defensively stripping any code fences. |
| FR-012 | For each candidate, the system shall fetch TMDb metadata (genres, runtime, overview, language, director, cast, poster, watch providers). |
| FR-013 | For each candidate, the system shall attempt to fetch IMDb rating and vote count, Letterboxd rating, and Metacritic score. |
| FR-014 | The system shall treat any missing rating source as absent and shall still compute a composite score from available sources. |
| FR-015 | The system shall compute a composite score weighting IMDb 0.5, Letterboxd 0.3, Metacritic 0.2 (renormalized over available sources). |
| FR-016 | The system shall assign a quality badge: MASTERPIECE (≥9.0), CRITICALLY ACCLAIMED (≥8.0), HIGHLY RATED (≥7.0), GOOD (≥6.0), PASS (<6.0), based on IMDb rating. |
| FR-017 | The system shall exclude any title whose IMDb rating is below the active rating floor. |
| FR-018 | The system shall sort results by composite score descending, breaking ties by IMDb vote count descending. |
| FR-019 | The system shall return between 3 and 5 ranked recommendations when sufficient qualifying candidates exist. |
| FR-020 | For each returned title, the system shall generate a "why you'll love it" paragraph and a "convince you" paragraph grounded in the user's mood, examples, pacing, and the title's ratings. |

### 3.3 Results presentation

| ID | Requirement |
|---|---|
| FR-030 | Each result card shall display the title, year, IMDb-primary rating block, quality badge, synopsis, "why you'll love it," "convince you," genres/sub-genres, runtime, language, and streaming availability. |
| FR-031 | The system shall provide a sort control offering: composite, IMDb, votes, newest, runtime, Letterboxd. |
| FR-032 | The system shall provide an adjustable minimum-rating filter defaulting to 7.5. |
| FR-033 | The system shall provide a "Save to Watchlist" action on each card. |
| FR-034 | The system shall provide a detail modal showing cast, director, full synopsis, and provider breakdown for a selected title. |
| FR-035 | For mixed-origin results, the system shall tag each title with an origin/language label. |

### 3.4 Watchlist

| ID | Requirement |
|---|---|
| FR-040 | The system shall persist the watchlist in browser `localStorage`. |
| FR-041 | The watchlist shall survive page reloads within the same browser. |
| FR-042 | The system shall allow removing a title from the watchlist. |

## 4. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-001 | The system shall render results within 8 seconds at the 75th percentile for a typical request, using asynchronous parallel data fetching. |
| NFR-002 | The questionnaire shall be completable in under 60 seconds (median) for an MVP path. |
| NFR-003 | The UI shall be fully usable on a mobile viewport (mobile-first responsive design). |
| NFR-004 | The system shall cache enrichment results by title to avoid re-fetching and re-scraping within a configurable TTL. |
| NFR-005 | The system shall degrade gracefully: a missing ratings source, provider list, or Claude conviction text shall not block returning a result. |
| NFR-006 | The UI shall present loading and error states for every network-bound action. |
| NFR-007 | The system shall present a dark, cinematic visual theme consistent with the design system. |
| NFR-008 | External API failures shall be retried with backoff where safe and surfaced as user-friendly errors otherwise. |

## 5. Constraint, Security & Interface Requirements

| ID | Requirement |
|---|---|
| SR-001 | All third-party API keys (TMDb, Anthropic, RapidAPI) shall reside only on the backend and shall never be shipped to or exposed in the client. |
| SR-002 | All third-party calls (TMDb, Claude, ratings sources, JustWatch) shall be proxied through the backend. |
| SR-003 | Scraping shall respect rate limits, apply backoff, and cache results to minimize requests. |
| SR-004 | The system shall not persist personally identifiable information on the server in the MVP (preferences and watchlist are client-side). |
| SR-005 | Streaming availability shall be labeled region-aware and noted as subject to change. |
| IR-001 | The frontend shall communicate with the backend exclusively over the documented REST endpoints (see API Spec). |
| IR-002 | The backend shall return the `Recommendation` schema exactly as defined in the API Spec. |

## 6. Data Requirements

The canonical request (`UserPreferences`) and response (`Recommendation`) schemas are defined in the **API Specification** and the **Technical Design Document**. Every field returned to the client shall conform to those schemas; optional rating fields may be `null`.

## 7. Acceptance Criteria (MVP — Definition of Done)

The MVP is accepted when: a user completes the questionnaire in under ~60 seconds; the system returns 3–5 ranked picks, best composite rating first, none below the rating floor; each card shows IMDb-primary ratings, synopsis, "why you'll love it," and where to stream; the watchlist persists across reloads; and the app works on mobile.

---

*Requirement IDs in this document are referenced by the Technical Design (module mapping) and the Master SOP traceability matrix. Changes to any requirement must be logged in the Master SOP change log.*
