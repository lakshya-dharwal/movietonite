import { useState } from "react";
import type { Recommendation } from "../../lib/types";
import RatingBadge from "./RatingBadge";
import MovieDetailSheet from "./MovieDetailSheet";

interface Props {
  rec: Recommendation;
  saved: boolean;
  onToggleSave: (rec: Recommendation) => void;
}

function runtimeLabel(min: number): string {
  if (!min) return "";
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
}

export default function MovieCard({ rec, saved, onToggleSave }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <article className="animate-fade-in card-hover overflow-hidden rounded-card border border-hairline bg-surface shadow-card lg:grid lg:grid-cols-[0.38fr_0.62fr]">
        <div className="relative">
          {rec.poster_url ? (
            <img
              src={rec.poster_url}
              alt={`${rec.title} poster`}
              loading="lazy"
              className="h-64 w-full object-cover lg:h-full"
            />
          ) : (
            <div className="poster-placeholder h-64 w-full lg:h-full" />
          )}
        </div>

        <div className="flex flex-1 flex-col gap-4 p-5 lg:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-xl font-semibold leading-tight text-ink">
                {rec.title} <span className="font-normal text-ink-dim">({rec.year})</span>
              </h3>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-dim">
                {rec.runtime_min > 0 && <span>{runtimeLabel(rec.runtime_min)}</span>}
                {rec.genres.slice(0, 3).map((g) => (
                  <span key={g}>{g}</span>
                ))}
              </div>
            </div>
            <button
              onClick={() => onToggleSave(rec)}
              aria-pressed={saved}
              className={
                "shrink-0 rounded-full px-3 py-2 text-xs font-semibold transition-colors " +
                (saved
                  ? "border border-accent bg-surface-2 text-accent"
                  : "bg-accent text-accent-ink hover:bg-accent-strong")
              }
            >
              {saved ? "✓ Saved" : "+ Watchlist"}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-[26px] font-semibold text-rating">{rec.imdb_rating.toFixed(1)}</span>
            <span className="text-xs text-ink-dim">IMDb · {rec.imdb_votes.toLocaleString()} votes</span>
            <RatingBadge badge={rec.rating_badge} />
          </div>

          {rec.why_youll_love_it && (
            <p className="text-sm leading-7 text-ink-dim">
              <span className="font-semibold text-accent">Why you&apos;ll love it — </span>
              {rec.why_youll_love_it}
            </p>
          )}

          <button
            onClick={() => setOpen(true)}
            className="self-start text-sm font-medium text-accent transition hover:text-accent-strong"
          >
            More info
          </button>

          <div className="mt-auto flex flex-wrap gap-2 pt-1">
            {rec.streaming_on.length > 0 ? (
              rec.streaming_on.slice(0, 4).map((p) => (
                <span
                  key={p}
                  className="rounded-full bg-surface-2 px-3 py-1.5 text-[11px] text-ink-dim"
                >
                  {p}
                </span>
              ))
            ) : rec.rent_buy_on.length > 0 ? (
              <span className="text-[11px] text-ink-dim">
                Rent/Buy: {rec.rent_buy_on.slice(0, 3).join(", ")}
              </span>
            ) : (
              <span className="text-[11px] text-ink-dim">Streaming info unavailable</span>
            )}
          </div>
        </div>
      </article>

      {open && (
        <MovieDetailSheet rec={rec} saved={saved} onClose={() => setOpen(false)} onToggleSave={onToggleSave} />
      )}
    </>
  );
}
