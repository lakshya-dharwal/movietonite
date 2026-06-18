import type { RecommendResponse, UserPreferences } from "./types";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export async function postRecommend(prefs: UserPreferences): Promise<RecommendResponse> {
  const resp = await fetch(`${BASE_URL}/recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(prefs),
  });
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
  return resp.json();
}
