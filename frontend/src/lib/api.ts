import type { MovieDetail, RecommendResponse, UserPreferences } from "./types";

const RAW_BASE = import.meta.env.VITE_API_BASE_URL?.trim();
const BASE_URL = RAW_BASE ? RAW_BASE.replace(/\/+$/, "") : "/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let resp: Response;
  try {
    resp = await fetch(`${BASE_URL}${path}`, init);
  } catch {
    throw new Error(
      "Couldn't reach the recommendation service. Start the backend or set VITE_API_BASE_URL.",
    );
  }

  if (!resp.ok) {
    let message = `Request failed (${resp.status})`;
    try {
      const body = await resp.json();
      message = body?.error?.message ?? message;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }

  return resp.json() as Promise<T>;
}

export function postRecommend(prefs: UserPreferences): Promise<RecommendResponse> {
  return request<RecommendResponse>("/recommend", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(prefs),
  });
}

export function getMovieDetail(tmdbId: number, mediaType: string): Promise<MovieDetail> {
  const params = new URLSearchParams({ media_type: mediaType });
  return request<MovieDetail>(`/movie/${tmdbId}?${params.toString()}`);
}
