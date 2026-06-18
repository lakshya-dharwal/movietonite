import type { Recommendation } from "../../lib/types";
import RatingBadge from "../Results/RatingBadge";

interface Props {
  items: Recommendation[];
  onRemove: (tmdbId: number) => void;
}

export default function WatchlistPage({ items, onRemove }: Props) {
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-ink-dim">
        <p className="font-serif text-2xl text-ink">Your watchlist is empty</p>
        <p className="mt-2">Save picks from your results and they'll wait for you here — even after a reload.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-8">
      <h2 className="font-serif text-3xl font-semibold text-ink">Your watchlist</h2>
      {items.map((rec) => (
        <article
          key={rec.tmdb_id}
          className="flex items-center gap-4 rounded-card bg-surface p-3 shadow-card"
        >
          {rec.poster_url ? (
            <img src={rec.poster_url} alt="" className="h-24 w-16 shrink-0 rounded object-cover" />
          ) : (
            <div className="h-24 w-16 shrink-0 rounded bg-surface-2" />
          )}
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-medium text-ink">
              {rec.title} <span className="text-ink-dim">({rec.year})</span>
            </h3>
            <div className="mt-1 flex items-center gap-2">
              <span className="font-mono text-emerald">{rec.imdb_rating.toFixed(1)}</span>
              <RatingBadge badge={rec.rating_badge} />
            </div>
            {rec.streaming_on.length > 0 && (
              <p className="mt-1 truncate text-xs text-ink-dim">{rec.streaming_on.join(", ")}</p>
            )}
          </div>
          <button
            onClick={() => onRemove(rec.tmdb_id)}
            className="shrink-0 rounded-full px-3 py-1.5 text-xs text-ink-dim ring-1 ring-white/10 hover:text-ink hover:ring-white/30"
          >
            Remove
          </button>
        </article>
      ))}
    </div>
  );
}
