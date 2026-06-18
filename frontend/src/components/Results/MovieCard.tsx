import { useState } from "react";
import type { Recommendation } from "../../lib/types";
import RatingBadge from "./RatingBadge";

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
    <article className="animate-fade-in overflow-hidden rounded-card bg-surface shadow-card transition-shadow hover:shadow-card-hover sm:flex">
      <div className="relative sm:w-2/5 sm:shrink-0">
        {rec.poster_url ? (
          <img
            src={rec.poster_url}
            alt={`${rec.title} poster`}
            loading="lazy"
            className="h-64 w-full object-cover sm:h-full"
          />
        ) : (
          <div className="flex h-64 w-full items-center justify-center bg-surface-2 text-ink-dim sm:h-full">
            No image
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-sans text-lg font-bold leading-tight text-ink">
              {rec.title}{" "}
              <span className="font-normal text-ink-dim">({rec.year})</span>
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
              "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors " +
              (saved
                ? "bg-emerald text-bg"
                : "bg-surface-2 text-emerald ring-1 ring-emerald/30 hover:bg-emerald/10")
            }
          >
            {saved ? "✓ Saved" : "+ Watchlist"}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-mono text-2xl font-bold text-emerald">
            {rec.imdb_rating.toFixed(1)}
          </span>
          <span className="text-xs text-ink-dim">
            IMDb · {rec.imdb_votes.toLocaleString()} votes
          </span>
          <RatingBadge badge={rec.rating_badge} />
        </div>

        {rec.why_youll_love_it && (
          <p className="text-sm leading-relaxed text-ink">
            <span className="font-semibold text-emerald">Why you'll love it — </span>
            {rec.why_youll_love_it}
          </p>
        )}

        {(rec.synopsis || rec.convince_you || rec.cast.length > 0) && (
          <button
            onClick={() => setOpen((o) => !o)}
            className="self-start text-xs font-medium text-emerald hover:underline"
          >
            {open ? "Less info" : "More info"}
          </button>
        )}

        {open && (
          <div className="space-y-2 border-t border-white/5 pt-3 text-sm text-ink-dim animate-fade-in">
            {rec.synopsis && <p className="leading-relaxed">{rec.synopsis}</p>}
            {rec.convince_you && (
              <p className="leading-relaxed">
                <span className="font-semibold text-ink">The case for it — </span>
                {rec.convince_you}
              </p>
            )}
            {rec.director && (
              <p>
                <span className="text-ink">Director:</span> {rec.director}
              </p>
            )}
            {rec.cast.length > 0 && (
              <p>
                <span className="text-ink">Cast:</span> {rec.cast.join(", ")}
              </p>
            )}
          </div>
        )}

        <div className="mt-auto flex flex-wrap gap-2 pt-1">
          {rec.streaming_on.length > 0 ? (
            rec.streaming_on.slice(0, 4).map((p) => (
              <span
                key={p}
                className="rounded-full bg-surface-2 px-2.5 py-1 text-[11px] text-ink-dim"
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
  );
}
