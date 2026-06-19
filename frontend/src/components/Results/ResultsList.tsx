import { useMemo, useState } from "react";
import type { Recommendation } from "../../lib/types";
import MovieCard from "./MovieCard";
import SortFilterBar from "./SortFilterBar";

interface Props {
  results: Recommendation[];
  initialSort: string;
  initialMinRating: number;
  has: (tmdbId: number) => boolean;
  onToggleSave: (rec: Recommendation) => void;
}

// Client-side re-sort/filter so the user can adjust without a round-trip.
// (The backend still enforces rating-first + floor on the original fetch.)
function sortFn(sortBy: string) {
  switch (sortBy) {
    case "imdb":
      return (a: Recommendation, b: Recommendation) => b.imdb_rating - a.imdb_rating || b.imdb_votes - a.imdb_votes;
    case "votes":
      return (a: Recommendation, b: Recommendation) => b.imdb_votes - a.imdb_votes;
    case "newest":
      return (a: Recommendation, b: Recommendation) => b.year - a.year;
    case "runtime":
      return (a: Recommendation, b: Recommendation) => a.runtime_min - b.runtime_min;
    default:
      return (a: Recommendation, b: Recommendation) =>
        b.composite_score - a.composite_score || b.imdb_votes - a.imdb_votes;
  }
}

export default function ResultsList({ results, initialSort, initialMinRating, has, onToggleSave }: Props) {
  const [sortBy, setSortBy] = useState(initialSort);
  const [minRating, setMinRating] = useState(initialMinRating);

  const view = useMemo(
    () => results.filter((r) => r.imdb_rating >= minRating).slice().sort(sortFn(sortBy)),
    [results, sortBy, minRating],
  );

  return (
    <div className="space-y-5">
      <SortFilterBar
        sortBy={sortBy}
        minRating={minRating}
        onSortChange={setSortBy}
        onMinRatingChange={setMinRating}
      />
      {view.length === 0 ? (
        <p className="rounded-card border border-hairline bg-surface p-8 text-center text-ink-dim shadow-card">
          No picks meet that rating floor. Lower the minimum to see more.
        </p>
      ) : (
        <div className="space-y-5">
          {view.map((rec) => (
            <MovieCard
              key={rec.tmdb_id}
              rec={rec}
              saved={has(rec.tmdb_id)}
              onToggleSave={onToggleSave}
            />
          ))}
        </div>
      )}
    </div>
  );
}
