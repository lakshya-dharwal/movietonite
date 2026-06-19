import { useState } from "react";
import { postRecommend } from "./lib/api";
import type { Recommendation, UserPreferences } from "./lib/types";
import { useWatchlist } from "./hooks/useWatchlist";
import Questionnaire from "./components/Questionnaire/Questionnaire";
import ResultsList from "./components/Results/ResultsList";
import WatchlistPage from "./components/Watchlist/WatchlistPage";
import LoadingScreen from "./components/LoadingScreen";
import LandingPage from "./components/Landing/LandingPage";
import { PopcornGlyph, PopcornStripe, ThemeToggle, useTheme } from "./components/ThemeChrome";

type View = "landing" | "questionnaire" | "loading" | "results" | "error";
type Tab = "discover" | "watchlist";

export default function App() {
  const [view, setView] = useState<View>("landing");
  const [tab, setTab] = useState<Tab>("discover");
  const [results, setResults] = useState<Recommendation[]>([]);
  const [moodRead, setMoodRead] = useState("");
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [refreshNote, setRefreshNote] = useState("");
  const [shownTitles, setShownTitles] = useState<string[]>([]);
  const watchlist = useWatchlist();
  const { theme, setTheme } = useTheme();

  const runRecommend = async (p: UserPreferences) => {
    setTab("discover");
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

  const newSearch = () => {
    setView("questionnaire");
    setResults([]);
    setMoodRead("");
    setShownTitles([]);
    setRefreshNote("");
    setTab("discover");
  };

  const goHome = () => {
    setTab("discover");
    setView("landing");
  };

  const openDiscover = () => {
    setTab("discover");
    setView((current) => (current === "landing" ? "landing" : current));
  };

  const openHowItWorks = () => {
    setTab("discover");
    setView("landing");
    window.setTimeout(() => {
      document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  };

  return (
    <div className="min-h-full bg-bg">
      <PopcornStripe />
      <header className="sticky top-0 z-20 border-b border-hairline bg-bg backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-4 px-4 py-4 sm:px-8 lg:px-10">
          <button onClick={goHome} className="flex items-center gap-2.5 text-left">
            <PopcornGlyph />
            <span className="text-[15px] font-semibold lowercase text-ink">movietonite</span>
          </button>
          <nav className="flex items-center gap-2 text-[13px]">
            <button
              onClick={openHowItWorks}
              className="rounded-full px-3 py-1.5 text-ink-dim transition hover:text-ink"
            >
              How it works
            </button>
            <button
              onClick={openDiscover}
              className={
                "rounded-full px-3 py-1.5 transition " +
                (tab === "discover" ? "bg-surface-2 text-accent" : "text-ink-dim hover:text-ink")
              }
            >
              Discover
            </button>
            <button
              onClick={() => setTab("watchlist")}
              className={
                "rounded-full px-3 py-1.5 transition " +
                (tab === "watchlist" ? "bg-surface-2 text-accent" : "text-ink-dim hover:text-ink")
              }
            >
              Watchlist{watchlist.items.length > 0 && ` (${watchlist.items.length})`}
            </button>
            <ThemeToggle theme={theme} setTheme={setTheme} />
          </nav>
        </div>
      </header>

      <main>
        {tab === "watchlist" ? (
          <WatchlistPage items={watchlist.items} onRemove={watchlist.remove} />
        ) : (
          <>
            {view === "landing" && (
              <LandingPage onStart={() => setView("questionnaire")} onOpenWatchlist={() => setTab("watchlist")} />
            )}
            {view === "questionnaire" && <Questionnaire onComplete={runRecommend} />}
            {view === "loading" && prefs && <LoadingScreen prefs={prefs} />}
            {view === "error" && (
              <div className="mx-auto max-w-2xl px-4 py-16 text-center">
                <div className="rounded-sheet border border-hairline bg-surface px-8 py-14 shadow-card">
                  <p className="eyebrow text-accent">Something Broke The Mood</p>
                  <p className="mt-3 font-serif text-3xl text-ink">Hmm.</p>
                  <p className="mt-3 text-ink-dim">{error}</p>
                  <button
                    onClick={newSearch}
                    className="mt-6 rounded-full bg-accent px-6 py-2.5 font-semibold text-accent-ink hover:bg-accent-strong"
                  >
                    Start over
                  </button>
                </div>
              </div>
            )}
            {view === "results" && prefs && (
              <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="eyebrow text-accent">Ranked Best-First</p>
                    <h2 className="mt-2 font-serif text-4xl font-medium text-ink">Your picks</h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={refresh}
                      disabled={refreshing}
                      className="rounded-full border border-hairline bg-surface px-4 py-2 text-sm font-semibold text-accent transition hover:text-accent-strong disabled:opacity-50"
                    >
                      {refreshing ? "Re-rolling..." : "↺ Fresh picks"}
                    </button>
                    <button onClick={newSearch} className="text-sm text-accent transition hover:text-accent-strong">
                      New search
                    </button>
                  </div>
                </div>

                {moodRead && (
                  <p className="mb-5 rounded-card border-l-2 border-accent bg-surface px-4 py-3 text-sm italic leading-7 text-ink-dim shadow-card">
                    {moodRead}
                  </p>
                )}
                {refreshNote && <p className="mb-4 text-sm text-accent">{refreshNote}</p>}

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
