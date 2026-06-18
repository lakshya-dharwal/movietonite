// Generates cheeky, mood/genre-aware one-liners to show while recommendations load.
// Picks the most specific match: a genre *combo* first, then a single genre,
// then the mood, plus a couple of rotating generic quips.

import type { UserPreferences } from "./types";

const key = (a: string, b: string) => [a, b].sort().join("+");

// Two-genre combos — the spicy ones.
const COMBOS: Record<string, string> = {
  [key("horror", "romance")]: "So… a little romance, a little bloodshed. Date night for maniacs. 🔪❤️",
  [key("horror", "comedy")]: "You want to laugh AND scream the same breath. Bold. We respect it. 😱😂",
  [key("comedy", "romance")]: "Butterflies and belly-laughs incoming. Hopeless romantic with jokes, got it. 💘",
  [key("thriller", "scifi")]: "Paranoia in the future tense. Trust no one, especially the robots. 🤖",
  [key("crime", "thriller")]: "Someone did something terrible and you want every detail. Detective mode on. 🕵️",
  [key("horror", "thriller")]: "Maximum dread, minimum sleep tonight. Lights staying on? 🔦",
  [key("drama", "romance")]: "You're in your feelings and you WANT to cry. Tissues queued. 😭",
  [key("action", "comedy")]: "Explosions with punchlines. Popcorn's not gonna survive this. 💥🍿",
  [key("scifi", "drama")]: "Big ideas, bigger feelings. Existential but make it beautiful. 🌌",
  [key("fantasy", "action")]: "Swords, spells, and zero chill. Epic mode engaged. ⚔️",
  [key("comedy", "crime")]: "Crime, but make it ridiculous. Heist gone gloriously wrong. 💼",
  [key("documentary", "crime")]: "Real story, real chills. You'll be Googling at 2am. 📺",
};

const GENRE: Record<string, string> = {
  horror: "Cueing up the things that go bump. Sleeping with the lights on tonight. 👻",
  romance: "Warming up the slow-dance, longing-glance department. 💞",
  comedy: "Loading certified knee-slappers. Hydrate before laughing. 😂",
  thriller: "Tightening the screws. Edge of your seat, please. 🎬",
  scifi: "Spinning up other worlds and questionable timelines. 🚀",
  drama: "Pouring something rich and a little heavy. 🥃",
  crime: "Following the money and the bodies. 🔍",
  action: "Revving the engines. Buckle up. 🏎️",
  fantasy: "Opening a portal somewhere far more interesting. 🐉",
  documentary: "Gathering the true stories worth your night. 🎞️",
};

const MOOD: Record<string, string> = {
  chill: "Finding something soft to sink into. No stress, all vibes. 🛋️",
  energetic: "Matching your energy — fast, fun, no filler. ⚡",
  emotional: "Picking something that'll hit you right in the chest. 🫶",
  dark: "Descending into the good kind of bleak. 🌑",
  funny: "Hunting down the genuinely funny stuff. 🤣",
  surprise: "Trusting the curator. Eyes closed, taste on. 🎲",
};

const GENERIC = [
  "Consulting the algorithm and our questionable taste…",
  "Ranking the greats. Mediocrity not invited. ⭐",
  "Reading the room (your room). 🛋️",
];

export function buildLoadingCues(prefs: UserPreferences): string[] {
  const cues: string[] = [];

  // Genre combo (any pair among the selected genres).
  const g = prefs.genres;
  for (let i = 0; i < g.length && cues.length === 0; i++) {
    for (let j = i + 1; j < g.length; j++) {
      const combo = COMBOS[key(g[i], g[j])];
      if (combo) {
        cues.push(combo);
        break;
      }
    }
  }
  // Single-genre line.
  if (g[0] && GENRE[g[0]]) cues.push(GENRE[g[0]]);
  // Mood line.
  if (prefs.mood && MOOD[prefs.mood]) cues.push(MOOD[prefs.mood]);
  // Always end with a rotating generic so there's something to cycle to.
  cues.push(GENERIC[Math.floor(Math.random() * GENERIC.length)]);

  // De-dupe while preserving order.
  return [...new Set(cues)];
}
