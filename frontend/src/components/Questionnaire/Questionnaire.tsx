import { useMemo, useState } from "react";
import type { UserPreferences } from "../../lib/types";
import {
  DECADES,
  GENRES,
  INDIAN_LANGS,
  MEDIA_TYPES,
  MOODS,
  ORIGINS,
  PACING,
  TIMES,
  genreHasSubgenres,
  subgenreOptionsFor,
  type Option,
} from "../../lib/questionnaire";

interface Props {
  onComplete: (prefs: UserPreferences) => void;
}

type StepId =
  | "mood"
  | "time"
  | "media"
  | "genre"
  | "subgenre"
  | "decade"
  | "pacing"
  | "origin"
  | "examples";

const DEFAULT_PREFS: UserPreferences = {
  mood: "",
  time: "any",
  media_type: "either",
  genres: [],
  subgenres: [],
  pacing: "any",
  origin: "any",
  indian_langs: [],
  decades: [],
  recent_loves: [],
  exclude_titles: [],
  min_rating: 7.5,
  sort_by: "composite",
};

function OptionGrid({
  options,
  selected,
  multi,
  onSelect,
}: {
  options: Option[];
  selected: string[];
  multi?: boolean;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {options.map((opt) => {
        const active = selected.includes(opt.value);
        return (
          <button
            key={opt.value}
            onClick={() => onSelect(opt.value)}
            aria-pressed={active}
            className={
              "rounded-card border p-4 text-left transition-all " +
              (active
                ? "border-accent accent-panel shadow-card"
                : "border-hairline bg-surface hover:border-ink-mute")
            }
          >
            <div className="font-medium text-ink">{opt.label}</div>
            {opt.hint && <div className="mt-0.5 text-xs text-ink-dim">{opt.hint}</div>}
          </button>
        );
      })}
      {multi && <span className="sr-only">Multiple selections allowed</span>}
    </div>
  );
}

export default function Questionnaire({ onComplete }: Props) {
  const [prefs, setPrefs] = useState<UserPreferences>(DEFAULT_PREFS);
  const [stepIndex, setStepIndex] = useState(0);
  const [lovesText, setLovesText] = useState("");

  // Build the active step list; the sub-genre step only appears when relevant.
  const steps = useMemo<StepId[]>(() => {
    const base: StepId[] = ["mood", "time", "media", "genre"];
    if (genreHasSubgenres(prefs.genres)) base.push("subgenre");
    base.push("decade", "pacing", "origin", "examples");
    return base;
  }, [prefs.genres]);

  const step = steps[Math.min(stepIndex, steps.length - 1)];
  const progress = ((stepIndex + 1) / steps.length) * 100;

  const toggleArray = (
    key: "genres" | "subgenres" | "indian_langs" | "decades",
    value: string,
    max?: number,
  ) => {
    setPrefs((p) => {
      const cur = p[key];
      let next: string[];
      if (cur.includes(value)) next = cur.filter((v) => v !== value);
      else if (max && cur.length >= max) next = [...cur.slice(1), value];
      else next = [...cur, value];
      // Reset subgenres if genres change.
      if (key === "genres") return { ...p, genres: next, subgenres: [] };
      return { ...p, [key]: next };
    });
  };

  const setSingle = (key: "mood" | "time" | "media_type" | "pacing" | "origin", value: string) =>
    setPrefs((p) => ({ ...p, [key]: value }));

  const canAdvance = (): boolean => {
    if (step === "mood") return !!prefs.mood;
    if (step === "genre") return prefs.genres.length > 0;
    return true;
  };

  const next = () => {
    if (stepIndex < steps.length - 1) {
      setStepIndex((i) => i + 1);
    } else {
      const recent_loves = lovesText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      onComplete({ ...prefs, recent_loves });
    }
  };
  const back = () => setStepIndex((i) => Math.max(0, i - 1));

  const titles: Record<StepId, string> = {
    mood: "What's the mood tonight?",
    time: "How much time do you have?",
    media: "Movie or show?",
    genre: "Pick up to 3 genres",
    subgenre: "Narrow it down (optional)",
    decade: "Any era in mind? (optional)",
    pacing: "Slow burn or fast-paced?",
    origin: "Where should it come from?",
    examples: "Anything you recently loved?",
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="rounded-sheet border border-hairline bg-surface px-5 py-8 shadow-card sm:px-8 sm:py-10">
        <div className="mb-8 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
          <div className="h-full bg-accent transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>

        <h2 className="mb-1 font-serif text-3xl font-semibold text-ink sm:text-[32px]">{titles[step]}</h2>
        <p className="mb-6 font-mono text-[12px] uppercase tracking-[0.18em] text-ink-mute">
          Step {stepIndex + 1} of {steps.length}
        </p>

        <div className="min-h-[16rem]">
          {step === "mood" && (
            <OptionGrid options={MOODS} selected={[prefs.mood]} onSelect={(v) => setSingle("mood", v)} />
          )}
          {step === "time" && (
            <OptionGrid options={TIMES} selected={[prefs.time]} onSelect={(v) => setSingle("time", v)} />
          )}
          {step === "media" && (
            <OptionGrid
              options={MEDIA_TYPES}
              selected={[prefs.media_type]}
              onSelect={(v) => setSingle("media_type", v)}
            />
          )}
          {step === "genre" && (
            <OptionGrid
              options={GENRES}
              selected={prefs.genres}
              multi
              onSelect={(v) => toggleArray("genres", v, 3)}
            />
          )}
          {step === "subgenre" && (
            <OptionGrid
              options={subgenreOptionsFor(prefs.genres)}
              selected={prefs.subgenres}
              multi
              onSelect={(v) => toggleArray("subgenres", v)}
            />
          )}
          {step === "decade" && (
            <div className="space-y-3">
              <p className="text-sm text-ink-dim">
                Choose one or more eras, or skip for any time period.
              </p>
              <OptionGrid
                options={DECADES}
                selected={prefs.decades}
                multi
                onSelect={(v) => toggleArray("decades", v)}
              />
            </div>
          )}
          {step === "pacing" && (
            <OptionGrid options={PACING} selected={[prefs.pacing]} onSelect={(v) => setSingle("pacing", v)} />
          )}
          {step === "origin" && (
            <div className="space-y-5">
              <OptionGrid options={ORIGINS} selected={[prefs.origin]} onSelect={(v) => setSingle("origin", v)} />
              {(prefs.origin === "indian" || prefs.origin === "both") && (
                <div className="animate-fade-in">
                  <p className="mb-3 text-sm text-ink-dim">Preferred languages (optional)</p>
                  <OptionGrid
                    options={INDIAN_LANGS}
                    selected={prefs.indian_langs}
                    multi
                    onSelect={(v) => toggleArray("indian_langs", v)}
                  />
                </div>
              )}
            </div>
          )}
          {step === "examples" && (
            <div>
              <p className="mb-3 text-sm text-ink-dim">
                Name a few titles you loved. We&apos;ll match the taste. Comma-separated.
              </p>
              <textarea
                value={lovesText}
                onChange={(e) => setLovesText(e.target.value)}
                placeholder="e.g. Severance, Prisoners, Parasite"
                rows={3}
                className="w-full rounded-card border border-hairline bg-surface p-4 text-ink outline-none transition placeholder:text-ink-mute focus:border-accent"
              />
            </div>
          )}
        </div>

        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={back}
            disabled={stepIndex === 0}
            className="rounded-full px-4 py-2 text-sm text-ink-dim transition disabled:opacity-30 hover:text-ink"
          >
            ← Back
          </button>
          <button
            onClick={next}
            disabled={!canAdvance()}
            className="rounded-full bg-accent px-8 py-3 text-base font-semibold text-accent-ink transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-40"
          >
            {stepIndex === steps.length - 1 ? "Get my picks" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
