import { useEffect, useMemo, useState } from "react";
import type { UserPreferences } from "../lib/types";
import { buildLoadingCues } from "../lib/loadingCues";

interface Props {
  prefs: UserPreferences;
}

export default function LoadingScreen({ prefs }: Props) {
  const cues = useMemo(() => buildLoadingCues(prefs), [prefs]);
  const [i, setI] = useState(0);

  useEffect(() => {
    if (cues.length <= 1) return;
    const id = setInterval(() => setI((n) => (n + 1) % cues.length), 2300);
    return () => clearInterval(id);
  }, [cues]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <div className="mb-6 flex justify-center">
        <span className="inline-block animate-bounce text-5xl" aria-hidden>
          🎬
        </span>
      </div>

      {/* Cheeky, mood-aware cue (re-mounts on change for a soft fade) */}
      <p
        key={i}
        className="animate-fade-in mx-auto min-h-[3.5rem] max-w-lg font-serif text-2xl leading-snug text-ink"
      >
        {cues[i]}
      </p>

      <div className="mx-auto mt-8 h-1 w-48 overflow-hidden rounded-full bg-surface-2">
        <div className="h-full w-1/3 animate-[shimmer_1.3s_infinite_linear] bg-emerald shimmer" />
      </div>

      {/* Skeleton hint cards so the layout doesn't jump when results arrive */}
      <div className="mt-12 space-y-4 text-left">
        {[0, 1, 2].map((n) => (
          <div key={n} className="overflow-hidden rounded-card bg-surface shadow-card sm:flex">
            <div className="shimmer h-40 sm:h-36 sm:w-2/5" />
            <div className="flex-1 space-y-3 p-5">
              <div className="shimmer h-5 w-2/3 rounded" />
              <div className="shimmer h-7 w-24 rounded" />
              <div className="shimmer h-12 w-full rounded" />
            </div>
          </div>
        ))}
      </div>

      <p className="mt-6 text-xs text-ink-dim">Ranking the greats — this takes a few seconds.</p>
    </div>
  );
}
