import { useState } from "react";
import { postRecommend } from "./lib/api";
import type { Recommendation, UserPreferences } from "./lib/types";
import { useWatchlist } from "./hooks/useWatchlist";
import Questionnaire from "./components/Questionnaire/Questionnaire";
import ResultsList from "./components/Results/ResultsList";
import WatchlistPage from "./components/Watchlist/WatchlistPage";
import LoadingScreen from "./components/LoadingScreen";

type View = "questionnaire" | "loading" | "results" | "error";
type Tab = "discover" | "watchlist";

export default function App() {
  const [view, setView] = useState<View>("questionnaire");
  const [tab, setTab] = useState<Tab>("discover");
  const [results, setResults] = useState<Recommendation[]>([]);
  const [moodRead, setMoodRead] = useState("");
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [refreshNote, setRefreshNote] = useState("");
  // Every title shown this session, so refreshes never repeat a pick.
  const [shownTitles, setShownTitles] = useState<string[]>([]);
  const watchlist = useWatchlist();

  const runRecommend = async (p: UserPreferences) => {
    setPrefs(p);
    setView("loading");
    setError("");
    setRefreshNote("");
    setShownTitles([]);
    try {
      const data = await postRecommend({ ...p, exclude_titles: [] });
      setResults(data.results);
      setMoodRead(data.mood_read);
      if (data.results.length === 0) {
        setError("No picks cleared the quality floor. Try widening your genres or lowering the minimum rating.");
        setView("error");
      } else {
        setShownTitles(data.results.map((r) => r.title));
        setView("results");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      setView("error");
    }
  };

  // Re-roll: ask for fresh picks, excluding everything already seen this session.
  const refresh = async () => {
    if (!prefs || refreshing) return;
    setRefreshing(true);
    setRefreshNote("");
    try {
      const data = await postRecommend({ ...prefs, exclude_titles: shownTitles });
      if (data.results.length === 0) {
        setRefreshNote("That's the bottom of the barrel for these filters — try a New search for more.");
      } else {
        setResults(data.results);
        if (data.mood_read) setMoodRead(data.mood_read);
        setShownTitles((prev) => [...new Set([...prev, ...data.results.map((r) => r.title)])]);
      }
    } catch (e) {
      setRefreshNote(e instanceof Error ? e.message : "Couldn't refresh — try again.");
    } finally {
      setRefreshing(false);
    }
  };

  const restart = () => {
    setView("questionnaire");
    setResults([]);
    setMoodRead("");
    setShownTitles([]);
    setRefreshNote("");
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
            {view === "loading" && prefs && <LoadingScreen prefs={prefs} />}
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
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h2 className="font-serif text-2xl font-semibold text-ink">Your picks</h2>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={refresh}
                      disabled={refreshing}
                      className="rounded-full bg-emerald/10 px-4 py-1.5 text-sm font-semibold text-emerald ring-1 ring-emerald/30 transition-opacity hover:bg-emerald/20 disabled:opacity-50"
                    >
                      {refreshing ? "Re-rolling…" : "↻ Fresh picks"}
                    </button>
                    <button onClick={restart} className="text-sm text-ink-dim hover:text-ink">
                      New search
                    </button>
                  </div>
                </div>

                {/* Curator's mood read — Claude's logic for this set */}
                {moodRead && (
                  <p className="mb-5 rounded-card border-l-2 border-emerald bg-surface/60 px-4 py-3 text-sm italic leading-relaxed text-ink-dim">
                    {moodRead}
                  </p>
                )}
                {refreshNote && <p className="mb-4 text-sm text-gold">{refreshNote}</p>}

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
