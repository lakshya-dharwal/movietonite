import { useEffect, useMemo, useState } from "react";
import type { UserPreferences } from "../lib/types";
import { buildLoadingCues } from "../lib/loadingCues";
import { PopcornGlyph } from "./ThemeChrome";

interface Props {
  prefs: UserPreferences;
}

export default function LoadingScreen({ prefs }: Props) {
  const cues = useMemo(() => buildLoadingCues(prefs), [prefs]);
  const [i, setI] = useState(0);
  const stages = ["Reading the vibe", "Ranking the good stuff", "Checking where it streams"];
  const activeStage = i % stages.length;

  useEffect(() => {
    if (cues.length <= 1) return;
    const id = setInterval(() => setI((n) => (n + 1) % cues.length), 2400);
    return () => clearInterval(id);
  }, [cues]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="relative overflow-hidden rounded-sheet border border-hairline bg-surface px-6 py-10 shadow-card sm:px-10">
        <PopcornGlyph size={30} className="absolute left-8 top-7 opacity-70 animate-pop-a" />
        <PopcornGlyph size={24} className="absolute right-10 top-10 opacity-60 animate-pop-b" />
        <PopcornGlyph size={18} className="absolute bottom-8 left-[18%] opacity-50 animate-pop-a" />

        <p className="eyebrow text-accent">Curating Your Night</p>
        <p
          key={i}
          className="animate-fade-in mt-4 min-h-[5.5rem] max-w-3xl font-serif text-3xl font-medium leading-[1.08] text-ink sm:text-[2.7rem]"
        >
          {cues[i]}
        </p>
        <p className="mt-4 max-w-2xl text-[15px] leading-7 text-ink-dim">
          We&apos;re reading the vibe, ranking the best-rated matches, and filtering out the mediocre ones.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          {stages.map((stage, index) => {
            const active = activeStage === index;
            return (
              <span
                key={stage}
                className={
                  "rounded-full border px-4 py-2 text-[12px] font-medium transition-colors " +
                  (active
                    ? "border-accent bg-accent text-accent-ink"
                    : "border-hairline bg-surface-2 text-ink-dim")
                }
              >
                {stage}
              </span>
            );
          })}
        </div>

        <div className="mx-auto mt-8 h-1.5 w-full max-w-md overflow-hidden rounded-full bg-surface-2">
          <div className="shimmer h-full w-1/3 rounded-full bg-accent" />
        </div>
      </div>

      <div className="mt-8 space-y-4 text-left">
        {[0, 1, 2].map((n) => (
          <div
            key={n}
            className="overflow-hidden rounded-card border border-hairline bg-surface shadow-card sm:grid sm:grid-cols-[0.38fr_0.62fr]"
          >
            <div className="poster-placeholder h-44 sm:h-full" />
            <div className="space-y-4 p-5 sm:p-6">
              <div className="title-bar shimmer w-2/3 rounded" />
              <div className="flex items-center gap-3">
                <div className="title-bar shimmer h-7 w-24 rounded" />
                <div className="sub-bar w-28" />
              </div>
              <div className="space-y-2">
                <div className="title-bar shimmer h-4 w-full rounded" />
                <div className="title-bar shimmer h-4 w-[88%] rounded" />
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="sub-bar h-8 w-20" />
                <span className="sub-bar h-8 w-24" />
                <span className="sub-bar h-8 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-6 text-center text-xs uppercase tracking-[0.2em] text-ink-mute">
        Ranking the greats. This takes a few seconds.
      </p>
    </div>
  );
}
