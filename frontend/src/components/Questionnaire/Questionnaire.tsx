import { useMemo, useState } from "react";
import type { UserPreferences } from "../../lib/types";
import {
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
  recent_loves: [],
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
              "rounded-card p-4 text-left transition-all " +
              (active
                ? "bg-emerald/15 ring-2 ring-emerald"
                : "bg-surface ring-1 ring-white/5 hover:ring-white/20")
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
    base.push("pacing", "origin", "examples");
    return base;
  }, [prefs.genres]);

  const step = steps[Math.min(stepIndex, steps.length - 1)];
  const progress = ((stepIndex + 1) / steps.length) * 100;

  const toggleArray = (key: "genres" | "subgenres" | "indian_langs", value: string, max?: number) => {
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
    pacing: "Slow burn or fast-paced?",
    origin: "Where should it come from?",
    examples: "Anything you recently loved?",
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8 h-1 w-full overflow-hidden rounded-full bg-surface-2">
        <div className="h-full bg-emerald transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      <h2 className="mb-1 font-serif text-3xl font-semibold text-ink">{titles[step]}</h2>
      <p className="mb-6 text-sm text-ink-dim">
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
              Name a few titles you loved — we'll match the taste. Comma-separated.
            </p>
            <textarea
              value={lovesText}
              onChange={(e) => setLovesText(e.target.value)}
              placeholder="e.g. Severance, Prisoners, Parasite"
              rows={3}
              className="w-full rounded-card bg-surface p-4 text-ink outline-none ring-1 ring-white/10 placeholder:text-ink-dim/60 focus:ring-emerald"
            />
          </div>
        )}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={back}
          disabled={stepIndex === 0}
          className="rounded-full px-4 py-2 text-sm text-ink-dim disabled:opacity-30 hover:text-ink"
        >
          ← Back
        </button>
        <button
          onClick={next}
          disabled={!canAdvance()}
          className="rounded-full bg-emerald px-8 py-3 text-base font-semibold text-bg transition-opacity disabled:cursor-not-allowed disabled:opacity-40 hover:opacity-90"
        >
          {stepIndex === steps.length - 1 ? "Get my picks" : "Next"}
        </button>
      </div>
    </div>
  );
}
