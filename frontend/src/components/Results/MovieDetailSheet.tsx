import { useEffect, useState } from "react";
import { getMovieDetail } from "../../lib/api";
import type { MovieDetail, Recommendation } from "../../lib/types";
import RatingBadge from "./RatingBadge";

interface Props {
  rec: Recommendation;
  saved: boolean;
  onClose: () => void;
  onToggleSave: (rec: Recommendation) => void;
}

function runtimeLabel(min: number): string {
  if (!min) return "";
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
}

export default function MovieDetailSheet({ rec, saved, onClose, onToggleSave }: Props) {
  const [detail, setDetail] = useState<MovieDetail | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    void getMovieDetail(rec.tmdb_id, rec.media_type)
      .then((data) => {
        if (active) setDetail(data);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "Couldn't load the detail view.");
      });

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      active = false;
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, rec.media_type, rec.tmdb_id]);

  const synopsis = detail?.full_synopsis || rec.synopsis;
  const runtime = detail?.runtime_min ?? rec.runtime_min;
  const genres = detail?.genres?.length ? detail.genres : rec.genres;
  const director = detail?.director || rec.director;
  const cast = detail?.cast?.length ? detail.cast : rec.cast;
  const streaming = detail?.streaming_on?.length ? detail.streaming_on : rec.streaming_on;
  const rentBuy = detail?.rent_buy_on?.length ? detail.rent_buy_on : rec.rent_buy_on;
  const imdbRating = detail?.imdb_rating ?? rec.imdb_rating;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center px-3 pb-3 pt-10 sm:items-center sm:px-6"
      style={{ backgroundColor: "rgba(12, 10, 8, 0.62)" }}
      onClick={onClose}
    >
      <div
        className="relative max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-sheet border border-hairline bg-surface shadow-card-hover"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full border border-hairline bg-surface px-3 py-1.5 text-sm text-ink-dim transition hover:text-ink"
        >
          Close
        </button>

        <div className="relative h-52">
          {detail?.backdrop_url ? (
            <img src={detail.backdrop_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="backdrop-placeholder h-full w-full" />
          )}
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(180deg, transparent 40%, var(--surface) 100%)" }}
          />
        </div>

        <div className="relative -mt-11 overflow-y-auto px-5 pb-6 sm:px-8">
          <div className="rounded-sheet border border-hairline bg-surface px-5 py-6 shadow-card">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="font-serif text-3xl font-medium text-ink">
                  {rec.title} <span className="text-ink-dim">({rec.year})</span>
                </h3>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-ink-dim">
                  <span className="font-mono text-[30px] font-semibold text-rating">
                    {imdbRating ? imdbRating.toFixed(1) : rec.imdb_rating.toFixed(1)}
                  </span>
                  <RatingBadge badge={rec.rating_badge} />
                  <span>{runtimeLabel(runtime)}</span>
                  {genres.slice(0, 3).map((genre) => (
                    <span key={genre}>{genre}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-5 text-[15px] leading-7 text-ink-dim">
              {synopsis ? <p>{synopsis}</p> : <div className="title-bar shimmer h-4 w-full rounded" />}

              {rec.convince_you && (
                <p>
                  <span className="font-semibold text-ink">The case for it — </span>
                  {rec.convince_you}
                </p>
              )}

              {rec.why_youll_love_it && (
                <p>
                  <span className="font-semibold text-accent">Why you&apos;ll love it — </span>
                  {rec.why_youll_love_it}
                </p>
              )}

              {(director || cast.length > 0) && (
                <div className="space-y-2 text-sm">
                  {director && (
                    <p>
                      <span className="font-semibold text-ink">Director:</span> {director}
                    </p>
                  )}
                  {cast.length > 0 && (
                    <p>
                      <span className="font-semibold text-ink">Cast:</span> {cast.join(", ")}
                    </p>
                  )}
                </div>
              )}

              <div>
                <p className="eyebrow text-ink-mute">Where To Watch</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {streaming.length > 0 ? (
                    streaming.map((provider) => (
                      <span
                        key={provider}
                        className="rounded-full bg-surface-2 px-3 py-1.5 text-xs text-ink-dim"
                      >
                        {provider}
                      </span>
                    ))
                  ) : rentBuy.length > 0 ? (
                    rentBuy.map((provider) => (
                      <span
                        key={provider}
                        className="rounded-full bg-surface-2 px-3 py-1.5 text-xs text-ink-dim"
                      >
                        {provider}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-ink-dim">Streaming info unavailable</span>
                  )}
                </div>
              </div>

              {error && <p className="text-sm text-accent">{error}</p>}

              <button
                onClick={() => onToggleSave(rec)}
                className={
                  "mt-2 w-full rounded-full px-5 py-3 text-base font-semibold transition " +
                  (saved
                    ? "border border-accent bg-surface-2 text-accent"
                    : "bg-accent text-accent-ink hover:bg-accent-strong")
                }
              >
                {saved ? "Saved to watchlist" : "+ Save to watchlist"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
