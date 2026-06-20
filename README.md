# movietonite

Movietonite is a rating-first movie and TV recommendation app built for one specific moment:

**"I want something great to watch tonight. Just give me the right pick."**

Most pop-culture and recommendation platforms are excellent for browsing, tracking, reviews, discourse, or database lookups. Movietonite is optimized for something narrower and more useful in the moment: **getting you to an actually watchable, high-quality pick fast**.

It asks for the things that genuinely change what someone wants to watch:

- mood
- time available
- movie vs show
- genre and sub-genre
- pacing
- origin and Indian-language preferences
- examples of things you already love

Then it returns a short ranked set of picks, best-first, with a quality floor that filters out mediocre options.

## Why Movietonite feels different

### 1. It starts from intent, not browsing
IMDb, Letterboxd, and similar platforms are powerful discovery archives. Movietonite starts later in the decision chain:

**You already want to watch something. You just need the right something.**

Instead of opening a giant catalog and asking you to do the filtering work yourself, it narrows the field based on your actual viewing context.

### 2. It is built around "what fits tonight?"
A good recommendation is not just "a good movie."

It has to fit:

- your energy
- your available time
- your appetite for slow burn vs fast-paced
- whether you want something global, Indian, or both
- the specific texture of genres you want mixed together

That level of input customization is the core product, not an afterthought.

### 3. It is rating-first by design
Movietonite does not try to overwhelm you with volume.

It is designed around a simple product rule:

**the best-rated titles should rise to the top, and weak picks should get filtered out**

The app applies a rating floor and sorts strong candidates first, so the output is intentionally short, opinionated, and usable.

### 4. It makes a case for the pick
A recommendation should not just say *watch this*.

It should also answer:

- why this fits your current mood
- why it is worth your time
- why it is not just another random title in a long list

Movietonite adds an AI-powered conviction layer to make each recommendation feel hand-picked, not machine-dumped.

### 5. It is built for fast decision-making
The ideal outcome is not more browsing.

The ideal outcome is:

**you open the app, answer a few questions, get 3-5 strong picks, and hit play**

That is the whole philosophy of the product.

## Core experience

- Multi-step questionnaire for mood, time, genre, sub-genre, pacing, origin, and recent favorites
- Rating-first ranked results
- Adjustable minimum rating floor
- AI-generated "why you'll love it" and "the case for it" recommendation copy
- Watchlist saved in `localStorage`
- Loading screen with genre-aware and mood-aware cues
- Progressive detail view for cast, director, synopsis, and provider information
- Popcorn-theme landing page with light/dark mode

## Tech stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS

### Backend

- FastAPI
- Pydantic
- httpx

### External services

- Anthropic Claude API for curation and persuasion copy
- TMDb for metadata, posters, and provider information

## Repo structure

```text
.
├── backend/
├── frontend/
├── planning-docs/
├── CLAUDE.md
├── LAUNCH_CHECKLIST.md
└── render.yaml
```

## Local development

### 1. Backend

Create `backend/.env` from `backend/.env.example` and set:

```env
TMDB_API_KEY=...
ANTHROPIC_API_KEY=...
ALLOWED_ORIGIN=http://localhost:5173
```

Run:

```bash
cd backend
uvicorn main:app --reload --port 8000
```

### 2. Frontend

The frontend uses the local Vite proxy by default.

Run:

```bash
cd frontend
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

## Verification

Frontend production build:

```bash
cd frontend
npm run build
```

Backend tests:

```bash
cd backend
pytest
```

## Deployment notes

- Frontend is deployed on Vercel
- Backend is deployed on Render
- `VITE_API_BASE_URL` belongs in Vercel
- `TMDB_API_KEY`, `ANTHROPIC_API_KEY`, and `ALLOWED_ORIGIN` belong in Render

See [LAUNCH_CHECKLIST.md](./LAUNCH_CHECKLIST.md) for the deployment checklist.

## Product note

Movietonite is not trying to replace IMDb or Letterboxd as giant databases, review communities, or tracking tools.

It is trying to be better at a narrower, more frustrating problem:

**when you want to watch something now, and you want the recommendation to actually feel like it was picked for you.**
