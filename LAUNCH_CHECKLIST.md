# Movietonite Launch Checklist

## Current status

- Frontend builds successfully with `npm run build`.
- Backend tests pass with `pytest`.
- Local frontend/backend development is now wired through Vite's `/api` proxy.
- The app now includes the popcorn-theme landing page, light/dark theme toggle, upgraded loading screen copy, and a real movie detail sheet.

## Local run checklist

1. Create `backend/.env` from `backend/.env.example`.
2. Set `TMDB_API_KEY`.
3. Set `ANTHROPIC_API_KEY`.
4. Set `ALLOWED_ORIGIN=http://localhost:5173`.
5. Optionally set `VITE_API_BASE_URL` in `frontend/.env` only if the frontend is not using the local `/api` proxy.
6. Start the backend:
   `cd backend && uvicorn main:app --reload --port 8000`
7. Start the frontend:
   `cd frontend && npm install && npm run dev`

## Pre-deploy checklist

1. Deploy the backend and confirm `/health` returns `{"status":"ok"}`.
2. Set backend secrets in the host:
   `TMDB_API_KEY`, `ANTHROPIC_API_KEY`, `ALLOWED_ORIGIN`, `CACHE_TTL_SECONDS`, `ANTHROPIC_MODEL`.
3. Deploy the frontend.
4. If frontend and backend are on different domains, set `frontend/.env` / host env:
   `VITE_API_BASE_URL=https://your-backend-domain`
5. Set backend `ALLOWED_ORIGIN` to include the real frontend domain.
6. Run one full manual path:
   landing -> questionnaire -> loading -> results -> more info -> watchlist -> refresh picks.

## Remaining product work

- Secondary ratings are still placeholder-only in `backend/clients/ratings.py`.
- Regional provider accuracy still depends primarily on TMDb.
- There is no production monitoring/log aggregation yet.
- There is no authenticated or cloud-synced watchlist yet; watchlist storage is still `localStorage`.

## Recommended next moves

1. Add real Letterboxd/Metacritic or equivalent secondary-rating sources.
2. Deploy the backend first, then point the frontend to it with `VITE_API_BASE_URL`.
3. Do a mobile QA pass on real devices.
4. Add one lightweight e2e smoke test for the recommendation happy path.
