import { useState } from "react";
import { postRecommend } from "./lib/api";
import type { Recommendation, UserPreferences } from "./lib/types";
import { useWatchlist } from "./hooks/useWatchlist";
import Questionnaire from "./components/Questionnaire/Questionnaire";
import ResultsList from "./components/Results/ResultsList";
import WatchlistPage from "./components/Watchlist/WatchlistPage";

type View = "questionnaire" | "loading" | "results" | "error";
type Tab = "discover" | "watchlist";

function LoadingSkeletons() {
  return (
    <div className="mx-auto max-w-3xl space-y-5 px-4 py-8">
      <p className="text-center text-ink-dim">Curating your picks…</p>
      {[0, 1, 2].map((i) => (
        <div key={i} className="overflow-hidden rounded-card bg-surface shadow-card sm:flex">
          <div className="shimmer h-64 sm:h-48 sm:w-2/5" />
          <div className="flex-1 space-y-3 p-5">
            <div className="shimmer h-5 w-2/3 rounded" />
            <div className="shimmer h-8 w-24 rounded" />
            <div className="shimmer h-16 w-full rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [view, setView] = useState<View>("questionnaire");
  const [tab, setTab] = useState<Tab>("discover");
  const [results, setResults] = useState<Recommendation[]>([]);
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [error, setError] = useState("");
  const watchlist = useWatchlist();

  const runRecommend = async (p: UserPreferences) => {
    setPrefs(p);
    setView("loading");
    setError("");
    try {
      const data = await postRecommend(p);
      setResults(data.results);
      if (data.results.length === 0) {
        setError("No picks cleared the quality floor. Try widening your genres or lowering expectations.");
        setView("error");
      } else {
        setView("results");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      setView("error");
    }
  };

  const restart = () => {
    setView("questionnaire");
    setResults([]);
    setTab("discover");
  };

  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-10 border-b border-white/5 bg-bg/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <button onClick={restart} className="text-left">
            <span className="font-serif text-lg font-semibold text-ink">What Should I Watch Tonight?</span>
          </button>
          <nav className="flex items-center gap-1 text-sm">
            <button
              onClick={() => setTab("discover")}
              className={"rounded-full px-3 py-1.5 " + (tab === "discover" ? "bg-emerald/15 text-emerald" : "text-ink-dim hover:text-ink")}
            >
              Discover
            </button>
            <button
              onClick={() => setTab("watchlist")}
              className={"rounded-full px-3 py-1.5 " + (tab === "watchlist" ? "bg-emerald/15 text-emerald" : "text-ink-dim hover:text-ink")}
            >
              Watchlist{watchlist.items.length > 0 && ` (${watchlist.items.length})`}
            </button>
          </nav>
        </div>
      </header>

      <main>
        {tab === "watchlist" ? (
          <WatchlistPage items={watchlist.items} onRemove={watchlist.remove} />
        ) : (
          <>
            {view === "questionnaire" && <Questionnaire onComplete={runRecommend} />}
            {view === "loading" && <LoadingSkeletons />}
            {view === "error" && (
              <div className="mx-auto max-w-2xl px-4 py-16 text-center">
                <p className="font-serif text-2xl text-ink">Hmm.</p>
                <p className="mt-2 text-ink-dim">{error}</p>
                <button
                  onClick={restart}
                  className="mt-6 rounded-full bg-emerald px-6 py-2.5 font-semibold text-bg hover:opacity-90"
                >
                  Start over
                </button>
              </div>
            )}
            {view === "results" && prefs && (
              <div className="mx-auto max-w-3xl px-4 py-8">
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="font-serif text-2xl font-semibold text-ink">Your picks</h2>
                  <button onClick={restart} className="text-sm text-emerald hover:underline">
                    ↺ New search
                  </button>
                </div>
                <ResultsList
                  results={results}
                  initialSort={prefs.sort_by}
                  initialMinRating={prefs.min_rating}
                  has={watchlist.has}
                  onToggleSave={watchlist.toggle}
                />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
