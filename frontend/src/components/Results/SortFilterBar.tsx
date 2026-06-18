interface Props {
  sortBy: string;
  minRating: number;
  onSortChange: (v: string) => void;
  onMinRatingChange: (v: number) => void;
}

const SORTS = [
  { value: "composite", label: "Best rated" },
  { value: "imdb", label: "IMDb rating" },
  { value: "votes", label: "Most voted" },
  { value: "newest", label: "Newest" },
  { value: "runtime", label: "Shortest" },
];

export default function SortFilterBar({ sortBy, minRating, onSortChange, onMinRatingChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-card bg-surface px-4 py-3 text-sm">
      <label className="flex items-center gap-2">
        <span className="text-ink-dim">Sort</span>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="rounded-md bg-surface-2 px-2 py-1 text-ink outline-none ring-1 ring-white/10 focus:ring-emerald"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-1 items-center gap-3">
        <span className="whitespace-nowrap text-ink-dim">
          Min rating <span className="font-mono text-emerald">{minRating.toFixed(1)}</span>
        </span>
        <input
          type="range"
          min={5}
          max={9.5}
          step={0.1}
          value={minRating}
          onChange={(e) => onMinRatingChange(parseFloat(e.target.value))}
          className="h-1 flex-1 cursor-pointer accent-emerald"
        />
      </label>
    </div>
  );
}
