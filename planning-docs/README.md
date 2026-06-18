# Planning Documents — "What Should I Watch Tonight?"

A rating-first movie & TV recommendation web app. This folder holds the full set of documents created before designing and building the app. Start with the **Master SOP** — it links and tracks everything.

| # | Document | Read it for |
|---|---|---|
| **00** | **Master SOP** (`00_MASTER-SOP_...md`) | The single source of truth. Tracks requirements traceability, decisions, risks, and all changes. Links every other doc. **Start here.** |
| 01 | PRD (`01_PRD_...md`) | What we're building and why: vision, problem, personas, scope, success metrics |
| 02 | SRS (`02_SRS_...md`) | Exact functional, non-functional, and security requirements with IDs |
| 03 | Technical Design (`03_Technical-Design-Architecture.md`) | Architecture, data models, algorithms, integrations, deployment, security |
| 04 | API Spec (`04_API-Specification.md`) | Endpoint contracts and request/response schemas |
| 05 | UX/UI Design Spec (`05_UX-UI-Design-Spec-and-Design-System.md`) | User flows, components, and the full design system (cinematic dark mode / emerald / sans-first / image-first / flat) |
| 06 | Roadmap & Backlog (`06_Project-Roadmap-and-Sprint-Backlog.md`) | Phases, milestones, sprint stories, estimates, risks |
| 07 | Decisions Q&A (`07_Design-and-Engineering-Decisions-QA.md`) | Every product/design/coding question answered, with open items flagged |
| 08 | AI Build Prompt (`08_AI-Build-Prompt.md`) | Ready-to-paste prompt to build the app phase by phase |
| 09 | Engineering Standards & Production-Readiness (`09_Engineering-Standards-and-Production-Readiness.md`) | The full "real app underneath" checklist: architecture, validation, errors, security, env, testing, deploy, observability, accessibility, git hygiene — tagged MVP-now vs Prod-later |
| 10 | Data Model & Database Schema (`10_Data-Model-and-Database-Schema.md`) | MVP localStorage shapes + production Postgres schema, relationships, indexes, migrations |
| 11 | Auth & Authorization Spec (`11_Auth-and-Authorization-Spec.md`) | Signup/login, sessions, roles, per-user access (Phase 5+) |

**Repo root:** `../CLAUDE.md` is the entry point Claude Code reads automatically — project rules, doc index, scope boundary, and Definition of Done.

### Feeding this to Claude Code

Put this whole project in a Git repo. Claude Code auto-reads `CLAUDE.md` at the root. To start: paste the **System/Context block** from doc 08, then one **phase prompt** at a time, verifying each phase before the next. Docs 02/03/04 are the contracts it builds to; 05 is for UI; 09 is the production gate; 10/11 are Phase 5+.

## Decided direction at a glance

- **Product:** Rating-first recommendations — best composite rating always first, quality floor (default 7.5 IMDb) filters out mediocre picks.
- **Stack:** React + TypeScript + Tailwind + shadcn/ui · FastAPI (async) · Claude API · TMDb · IMDb/Letterboxd/Metacritic · JustWatch.
- **Storage (MVP):** `localStorage` only, no auth.
- **Design:** Sophisticated minimalism × cinematic dark mode — near-black `#0F0F0F`, single emerald/teal accent, sans-first with serif headlines, image-first 10px cards, flat subtle shadows, restrained functional motion.

## Open decisions to resolve

Logo/wordmark · cache backend (Redis vs SQLite) · RapidAPI IMDb endpoint · optional accounts in MVP · trailers in MVP. (Tracked in Master SOP Appendix F.)
