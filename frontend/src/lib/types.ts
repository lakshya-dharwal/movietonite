// TS mirror of the backend Pydantic models (planning-docs/04 §3).

export interface UserPreferences {
  mood: string;
  time: string;
  media_type: string;
  genres: string[];
  subgenres: string[];
  pacing: string;
  origin: string;
  indian_langs: string[];
  recent_loves: string[];
  min_rating: number;
  sort_by: string;
}

export interface Recommendation {
  title: string;
  year: number;
  tmdb_id: number;
  media_type: string;
  composite_score: number;
  rating_badge: string;
  imdb_rating: number;
  imdb_votes: number;
  letterboxd_rating: number | null;
  metacritic_score: number | null;
  synopsis: string;
  convince_you: string;
  why_youll_love_it: string;
  genres: string[];
  subgenres: string[];
  pacing: string;
  runtime_min: number;
  language: string;
  director: string;
  cast: string[];
  streaming_on: string[];
  rent_buy_on: string[];
  poster_url: string | null;
}

export interface RecommendResponse {
  results: Recommendation[];
}
