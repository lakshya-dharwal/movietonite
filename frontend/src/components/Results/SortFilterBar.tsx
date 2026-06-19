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
    <div className="flex flex-wrap items-center gap-x-5 gap-y-4 rounded-card border border-hairline bg-surface px-4 py-3 text-sm shadow-card">
      <label className="flex items-center gap-3">
        <span className="eyebrow text-ink-mute">Sort</span>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="rounded-full border border-hairline bg-surface-2 px-3 py-2 text-sm text-ink outline-none transition focus:border-accent"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-1 items-center gap-3">
        <span className="whitespace-nowrap eyebrow text-ink-mute">
          Min rating <span className="ml-1 font-mono text-rating">{minRating.toFixed(1)}</span>
        </span>
        <input
          type="range"
          min={5}
          max={9.5}
          step={0.1}
          value={minRating}
          onChange={(e) => onMinRatingChange(parseFloat(e.target.value))}
          className="h-1 flex-1 cursor-pointer accent-accent"
        />
      </label>
    </div>
  );
}
