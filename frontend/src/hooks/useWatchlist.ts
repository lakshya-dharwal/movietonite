import { useCallback, useEffect, useState } from "react";
import type { Recommendation } from "../lib/types";

const KEY = "wsiwt:watchlist";

function load(): Recommendation[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Recommendation[]) : [];
  } catch {
    return [];
  }
}

export function useWatchlist() {
  const [items, setItems] = useState<Recommendation[]>(load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      /* storage full / unavailable — ignore */
    }
  }, [items]);

  const has = useCallback(
    (tmdbId: number) => items.some((i) => i.tmdb_id === tmdbId),
    [items],
  );

  const toggle = useCallback((rec: Recommendation) => {
    setItems((prev) =>
      prev.some((i) => i.tmdb_id === rec.tmdb_id)
        ? prev.filter((i) => i.tmdb_id !== rec.tmdb_id)
        : [...prev, rec],
    );
  }, []);

  const remove = useCallback((tmdbId: number) => {
    setItems((prev) => prev.filter((i) => i.tmdb_id !== tmdbId));
  }, []);

  return { items, has, toggle, remove };
}
