// Questionnaire step + option definitions. Drives the 8-step flow declaratively.

export interface Option {
  value: string;
  label: string;
  hint?: string;
}

export const MOODS: Option[] = [
  { value: "chill", label: "Chill", hint: "Easy, comforting" },
  { value: "energetic", label: "Energetic", hint: "Fast & fun" },
  { value: "emotional", label: "Emotional", hint: "Make me feel" },
  { value: "dark", label: "Dark", hint: "Tense, heavy" },
  { value: "funny", label: "Funny", hint: "Laugh out loud" },
  { value: "surprise", label: "Surprise me", hint: "Curator's choice" },
];

export const TIMES: Option[] = [
  { value: "20-30m", label: "20–30 min" },
  { value: "1h", label: "~1 hour" },
  { value: "2h+", label: "2h+" },
  { value: "any", label: "Any length" },
];

export const MEDIA_TYPES: Option[] = [
  { value: "movie", label: "Movie" },
  { value: "show", label: "TV Show" },
  { value: "either", label: "Either" },
];

export const GENRES: Option[] = [
  { value: "thriller", label: "Thriller" },
  { value: "scifi", label: "Sci-Fi" },
  { value: "drama", label: "Drama" },
  { value: "comedy", label: "Comedy" },
  { value: "horror", label: "Horror" },
  { value: "romance", label: "Romance" },
  { value: "action", label: "Action" },
  { value: "crime", label: "Crime" },
  { value: "fantasy", label: "Fantasy" },
  { value: "documentary", label: "Documentary" },
];

// Conditional sub-genres, keyed by genre value.
export const SUBGENRES: Record<string, Option[]> = {
  thriller: [
    { value: "psychological", label: "Psychological" },
    { value: "techno", label: "Techno / spy" },
    { value: "legal", label: "Legal" },
  ],
  scifi: [
    { value: "time_travel", label: "Time travel" },
    { value: "dystopian", label: "Dystopian" },
    { value: "space_opera", label: "Space opera" },
  ],
  horror: [
    { value: "psychological_horror", label: "Psychological" },
    { value: "slasher", label: "Slasher" },
    { value: "supernatural", label: "Supernatural" },
  ],
  comedy: [
    { value: "dark_comedy", label: "Dark comedy" },
    { value: "romcom", label: "Rom-com" },
    { value: "satire", label: "Satire" },
  ],
  crime: [
    { value: "heist", label: "Heist" },
    { value: "noir", label: "Noir" },
    { value: "mob", label: "Mob / mafia" },
  ],
  drama: [
    { value: "coming_of_age", label: "Coming of age" },
    { value: "historical", label: "Historical" },
    { value: "courtroom", label: "Courtroom" },
  ],
};

export const PACING: Option[] = [
  { value: "slow", label: "Slow burn" },
  { value: "fast", label: "Fast-paced" },
  { value: "any", label: "Either" },
];

export const ORIGINS: Option[] = [
  { value: "global", label: "Global / Hollywood" },
  { value: "indian", label: "Indian cinema" },
  { value: "both", label: "Both" },
  { value: "any", label: "No preference" },
];

export const DECADES: Option[] = [
  { value: "1990s", label: "90s", hint: "1990–1999" },
  { value: "2000s", label: "2000s", hint: "2000–2009" },
  { value: "2010s", label: "2010s", hint: "2010–2019" },
  { value: "2020s", label: "2020s", hint: "2020–now" },
];

export const INDIAN_LANGS: Option[] = [
  { value: "hindi", label: "Hindi" },
  { value: "tamil", label: "Tamil" },
  { value: "telugu", label: "Telugu" },
  { value: "malayalam", label: "Malayalam" },
  { value: "kannada", label: "Kannada" },
  { value: "marathi", label: "Marathi" },
  { value: "bengali", label: "Bengali" },
  { value: "punjabi", label: "Punjabi" },
];

export function genreHasSubgenres(genres: string[]): boolean {
  return genres.some((g) => SUBGENRES[g]?.length);
}

export function subgenreOptionsFor(genres: string[]): Option[] {
  return genres.flatMap((g) => SUBGENRES[g] ?? []);
}
