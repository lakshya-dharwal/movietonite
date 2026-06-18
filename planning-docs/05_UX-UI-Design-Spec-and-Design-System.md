# UX / UI Design Spec & Design System
## "What Should I Watch Tonight?"

| Field | Value |
|---|---|
| Document | UX / UI Design Spec & Design System |
| Product | What Should I Watch Tonight? (WSIWT) |
| Owner | Lakshya Dharwal |
| Version | v1.1 |
| Status | Draft |
| Date | June 18, 2026 |
| Design direction | Sophisticated minimalism × cinematic dark mode — near-black, high-contrast, image-first, single emerald accent, aggressive type hierarchy, card-based modular layout, restrained effects |
| Related docs | PRD, SRS, Technical Design, Design & Engineering Decisions Q&A |

> **v1.1 change:** Adopted the "Sophisticated Minimalism × Cinematic Dark Mode" design language. Background deepened to `#0F0F0F`; typography is now **sans-first with serif reserved for headlines**; effects are **flat and restrained** (subtle depth + functional motion only — glassmorphism and rich motion dropped). Accent remains **emerald/teal**.

---

## 1. Design Philosophy (Decided)

**"Sophisticated minimalism meets cinematic dark mode."** The interface is near-black, extremely high-contrast, and image-first: posters carry the screen, UI chrome recedes, and a single emerald accent marks everything interactive and "best." Typography hierarchy is aggressive — big, bold headlines and small, quiet metadata, with no muddy middle sizes. Layout is card-based and modular with generous negative space; the experience feels like a curated gallery, not an algorithmic feed. Effects are functional, not decorative.

In one line: **Dark, high-contrast, image-first, minimal-UI, single-accent, generous-spacing, card-based modular layout with extreme typographic hierarchy.**

## 2. Design Principles (the 20 cues, applied)

1. **Dark by default.** Near-black `#0F0F0F` everywhere; dark equals premium and cinematic.
2. **Extreme contrast.** White / light-gray text on black; zero ambiguity in readability.
3. **One signature accent.** Emerald/teal is the *only* bright color, used strategically — never a rainbow. Gold is reserved solely for the MASTERPIECE badge.
4. **Hero image dominance.** Poster/imagery occupies roughly 40–60% of a card or screen; text overlays the image.
5. **Massive typography.** Headlines are big and bold; hierarchy is aggressive with no middle-ground sizes.
6. **Card-based modular layout.** Content in rounded rectangular cards with breathing room and subtle shadow.
7. **Minimal UI, maximum content.** Hidden/minimal navigation (bottom nav on mobile, slim sidebar on desktop); only essential CTAs.
8. **Oversized CTAs.** Primary actions (Find my pick, Watch/Where to watch, Save) are large, circular/pill, in the accent color — impossible to miss.
9. **Generous negative space.** ~1.5rem (24px) gaps; cards never touch; nothing cramped.
10. **Sans-serif first.** Clean geometric sans (Inter) for all UI/body; a display **serif reserved for headlines only**.
11. **Minimal metadata, progressive disclosure.** Cards show title, year, rating, and a one-line hook; cast/full synopsis/providers live behind "More info."
12. **Horizontal carousels.** Browse sets (e.g., watchlist, "more like this") in swipeable horizontal sliders.
13. **Rounded corners ~10px.** Soft but not extreme; never sharp rectangles.
14. **Layered depth.** Subtle shadows give cards z-depth; hover adds a touch more — depth without clutter.
15. **Cinematic mood.** Dark base + emerald accent reads modern/curated; mood is moody and intentional.
16. **Ratings prominent.** IMDb/composite score always visible, often in the accent color, as clear secondary hierarchy.
17. **Curated, not a feed.** Structured, intentional, gallery-like — never infinite-scroll chaos.
18. **Mobile-first, scales up.** Designed tall/vertical for phones, then widened for desktop (more cards visible).
19. **Fast visual scanning.** Screen legible in under 2 seconds; consistent card structure; low cognitive load.
20. **Restraint in effects.** No excessive animation, no glassmorphism; subtle hover states; effects serve a purpose. Respect `prefers-reduced-motion`.

## 3. Color System

Near-black foundations, high-contrast light text, one emerald accent ramp, and semantic colors. Defined as design tokens (CSS variables / Tailwind theme extensions).

| Token | Hex | Use |
|---|---|---|
| `--bg-base` | `#0F0F0F` | App background (near-black) |
| `--bg-surface` | `#161616` | Cards / raised surfaces |
| `--bg-elevated` | `#1F1F1F` | Hover / nested surfaces, sheets |
| `--border-hairline` | `rgba(255,255,255,0.08)` | Hairline dividers, card edges |
| `--text-primary` | `#F5F5F5` | Primary text (near-white) |
| `--text-secondary` | `#B5B5B5` | Secondary / metadata text |
| `--text-muted` | `#7A7A7A` | Captions, disabled |
| `--accent` | `#2FD3A5` | Emerald accent — primary actions, links, ratings, focus |
| `--accent-strong` | `#14B98C` | Pressed / hover-deep accent |
| `--accent-soft` | `rgba(47,211,165,0.14)` | Accent fills, chips, badge tint |
| `--badge-masterpiece` | `#E6C36B` | Reserved gold — MASTERPIECE badge only |
| `--rating` | `#2FD3A5` | Rating numerals (accent, prominent) |
| `--warning` | `#E6B85C` | Region/availability caveats |
| `--danger` | `#E2685F` | Errors |

**Usage rules:** emerald is reserved for interactive elements, ratings, and "best" signals — never decoration. Gold appears *only* on the rare MASTERPIECE badge so it stays special. Avoid pure `#FFFFFF`/`#000000`; use the near-white / near-black tokens for a softer, premium contrast.

## 4. Typography

Sans-first system with a display serif reserved for headlines, and a monospace strictly for rating numerals.

| Role | Font (recommended) | Fallback | Notes |
|---|---|---|---|
| Display / headlines | **Fraunces** (high-contrast serif) | Georgia, serif | Landing hero, step questions, large section titles — headlines only |
| Body / UI / titles | **Inter** | system-ui, sans-serif | Buttons, labels, paragraphs, nav, card titles, metadata |
| Numeric / ratings | **JetBrains Mono** | ui-monospace | IMDb/composite numerals, runtime, votes |

### Type scale (mobile → desktop) — aggressive hierarchy

| Token | Size | Weight | Use |
|---|---|---|---|
| `display-xl` | 44 / 64px | Serif 500 | Landing hero ("What should I watch tonight?") |
| `display-l` | 32 / 44px | Serif 500 | Step question headers |
| `title-l` | 24 / 30px | Sans 700 | Card movie titles (bold sans) |
| `body-l` | 17 / 18px | Sans 400 | One-line hooks, why-you'll-love-it (when expanded) |
| `body-m` | 15px | Sans 400 | Default body, metadata |
| `label` | 12 / 13px | Sans 600, tracked +3% | Buttons, chips, eyebrows, badges |
| `mono-rating` | 18 / 20px | Mono 600 | Rating numerals (accent color) |

Headlines are deliberately large; metadata is deliberately small. Avoid intermediate sizes so the hierarchy stays sharp. Paragraph line length caps ~64–72 characters.

## 5. Spacing, Shape & Depth

- **Spacing scale (px):** 4, 8, 12, 16, **24 (default card gap / ~1.5rem)**, 32, 48, 64. Screen padding 20 (mobile) / 32 (desktop). Cards never touch.
- **Radius:** `--r` 10px (cards, inputs, images), `--r-lg` 16px (sheets/modal), `--r-pill` 999px (buttons, badges). Soft, not extreme.
- **Depth (flat + subtle shadow, no glass):** card rest `0 4px 16px rgba(0,0,0,0.45)`; hover `0 8px 28px rgba(0,0,0,0.55)` plus a faint `--accent-soft` edge. No `backdrop-filter` / frosted panels.
- **Imagery:** posters fill 40–60% of card area; text sits on a dark gradient scrim over the lower image so it stays legible.

## 6. Motion (Restrained, functional)

| Interaction | Behavior |
|---|---|
| Step → step | Quick crossfade + slight slide (~200ms); thin emerald progress bar fills |
| Card hover (desktop) | ~1.02 scale + slightly deeper shadow; no parallax, no content reveal animation |
| Card entrance | Simple fade-in (light stagger, ≤40ms); not theatrical |
| Carousel | Native momentum horizontal scroll; snap to card |
| Save to watchlist | Icon fill + brief accent pulse |
| Detail | "More info" expands a flat sheet/modal (scale-up ≤200ms) |
| Loading | Skeleton poster shimmer; "Curating your picks…" caption |

Rule: motion is functional, brief, and never gates content. Honor `prefers-reduced-motion` by replacing transitions with instant state changes (NFR-006).

## 7. Information Architecture & User Flow

```
Landing (near-black, serif hero, one oversized emerald CTA, faint poster backdrop)
  └─ "Find my pick" → Questionnaire
       1. Mood            (chill / energetic / emotional / dark / funny / surprise)
       2. Time            (20–30m / 1h / 2h+ / any)
       3. Media type      (movie / show / either)
       4. Genre           (up to 3)
       4B. Sub-genre      (conditional on genre)        ← layered
       5. Pacing          (slow / fast / any)           ← layered
       6. Origin          (global / Indian / both / any)← layered
            └─ Indian language picker (if Indian/both)
       7. Examples        (recent loves, free text)
       └─ Submit → Loading (skeletons) → Results
Results (card grid, ranked best-first; minimal metadata per card)
  ├─ Sort & Filter bar (sort + min-rating)
  ├─ MovieCards → "More info" expands detail (progressive disclosure)
  │     └─ Save to Watchlist (oversized accent action)
  └─ New Search / View Watchlist
Watchlist (localStorage; horizontal carousel + grid)
```

Navigation is minimal: a bottom nav (Home / Watchlist) on mobile and a slim sidebar on desktop; no extra chrome.

## 8. Key Screens & Components

### 8.1 Landing
Quiet near-black screen, a single large **serif** hero line, one **oversized emerald pill CTA** ("Find my pick"), and a faint, slow poster-collage in the deep background. No navigation clutter; the user understands the next action in under 2 seconds.

### 8.2 Questionnaire step
One question per screen. Large serif question header, small sans helper line, big rounded (10px) selectable cards/chips with emerald selection states, a thin emerald progress bar, and Back/Next. Calm, fast, completable in ~60 seconds (NFR-002). Sub-genre, pacing, and origin steps appear only when relevant (FR-003, FR-005).

### 8.3 MovieCard (the hero component)
Image-first card: the **poster dominates the top 40–60%**, with a dark gradient scrim. Below/over it, in order: **bold sans title** + year; a **prominent rating block** (mono IMDb numeral in emerald + quality badge, gold only for MASTERPIECE); a **single one-line hook**; small genre chips and runtime; an **oversized accent action** (Save / Where to watch); and a **"More info"** affordance. Full synopsis, cast, director, and provider breakdown are *not* on the card — they live behind "More info" (progressive disclosure, FR-030, FR-031). Rounded 10px corners, subtle shadow, ~1.5rem gaps between cards.

### 8.4 RatingBadge
Pill, emerald-tinted by default; MASTERPIECE uses the reserved gold. Shows the badge label plus the IMDb numeral in mono — the visual proof of the "rating-first" promise (FR-016, FR-030).

### 8.5 SortFilterBar
Slim bar pinned above the results grid: a sort dropdown (composite / IMDb / votes / newest / runtime / Letterboxd) and a min-rating slider defaulting to 7.5 (FR-031, FR-032).

### 8.6 Detail (progressive disclosure)
"More info" opens a flat sheet/modal (no glass) with a backdrop image, full synopsis, cast, director, budget, and full provider breakdown (FR-034). This is where layered metadata lives.

### 8.7 Watchlist
Saved titles in a horizontal carousel and grid, persisted in `localStorage`, with remove actions (FR-040–FR-042).

## 9. Indian-Content UX

When origin is Indian or both, a language picker appears (Hindi, Tamil, Telugu, Kannada, Malayalam, Punjabi, Marathi, Bengali, plus Web Series). Mixed results tag each card with an origin/language label, and the detail view surfaces Indian platforms (Zee5, Disney+ Hotstar, SonyLiv, Prime Video India, Netflix India, Mubi) with a region note (FR-005, FR-035).

## 10. States & Edge Cases

| State | Treatment |
|---|---|
| Loading | Skeleton posters with shimmer; "Curating your picks…" |
| Empty (no titles clear the floor) | Friendly note + a one-tap "lower the rating floor" suggestion |
| Missing rating source | Hide that source's chip; composite still shown; no broken UI |
| No streaming data | Show "Availability unknown for your region" caveat |
| Error | Inline error card with retry; never a dead end |

## 11. Accessibility

- Contrast: near-white body and emerald rating text meet WCAG AA against `#0F0F0F`; the accent is paired with shape/label cues (never color alone) for state.
- Full keyboard navigation through steps, carousels, and cards; visible emerald focus ring (`--accent`).
- Respect `prefers-reduced-motion`: replace transitions with instant state changes.
- Touch targets ≥ 44px; detail sheet traps focus and is dismissible.

## 12. Design Tokens (starter, for `tailwind.config` / CSS vars)

```css
:root{
  --bg-base:#0F0F0F; --bg-surface:#161616; --bg-elevated:#1F1F1F;
  --border-hairline:rgba(255,255,255,0.08);
  --text-primary:#F5F5F5; --text-secondary:#B5B5B5; --text-muted:#7A7A7A;
  --accent:#2FD3A5; --accent-strong:#14B98C; --accent-soft:rgba(47,211,165,0.14);
  --badge-masterpiece:#E6C36B; --warning:#E6B85C; --danger:#E2685F;
  --r:10px; --r-lg:16px; --r-pill:999px;
  --gap:24px; /* ~1.5rem default card gap */
  --shadow-card:0 4px 16px rgba(0,0,0,0.45);
  --shadow-hover:0 8px 28px rgba(0,0,0,0.55);
  --font-display:'Fraunces',Georgia,serif;   /* headlines only */
  --font-sans:'Inter',system-ui,sans-serif;  /* body + UI + titles */
  --font-mono:'JetBrains Mono',ui-monospace,monospace; /* ratings */
}
```

---

*This spec defines the visual and interaction system. Implement tokens once in the Tailwind/CSS layer and reference them everywhere. The philosophy in Sections 1–2 is the decided style and should not drift during build.*
