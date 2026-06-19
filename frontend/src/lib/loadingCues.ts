// Generates mood-aware loading copy. The first cues are the most specific
// matches; later ones are fallback lines so the screen always has something
// fresh to rotate through while the API call is in flight.

import type { UserPreferences } from "./types";

const key = (a: string, b: string) => [a, b].sort().join("+");

const COMBOS: Record<string, string> = {
  [key("horror", "romance")]:
    "Deadly and romantic. Someone's getting kissed or killed tonight, maybe both.",
  [key("horror", "comedy")]:
    "You want to laugh while you're scared out of your ass. Beautiful taste.",
  [key("comedy", "romance")]:
    "So we're chasing butterflies, banter, and at least one devastatingly charming lead.",
  [key("thriller", "scifi")]:
    "Paranoia in the future tense. Excellent. Nobody trust the machine.",
  [key("crime", "thriller")]:
    "You want lies, bad decisions, and a situation that gets worse every ten minutes.",
  [key("horror", "thriller")]:
    "Maximum dread, minimum peace. Very anti-relaxation programming.",
  [key("drama", "romance")]:
    "You came here to feel everything on purpose. Respectfully unstable behavior.",
  [key("action", "comedy")]:
    "Explosions with punchlines. The popcorn is not making it out alive.",
  [key("scifi", "drama")]:
    "Big ideas, bigger feelings. Existential spiral, but tasteful.",
  [key("fantasy", "action")]:
    "Swords, spells, and absolutely no indoor voice energy.",
  [key("comedy", "crime")]:
    "Crime, but with jokes. So: morally messy and extremely watchable.",
  [key("documentary", "crime")]:
    "Real story, real chills. You're about to become annoying at brunch with new facts.",
};

const GENRE: Record<string, string> = {
  horror: "Cueing up the things that make normal people check the locks twice.",
  romance: "Warming up the longing-glance department.",
  comedy: "Loading the genuinely funny stuff. No mercy chuckles.",
  thriller: "Tightening the screws now. Breathing normally is over.",
  scifi: "Spinning up alternate futures and at least one bad idea with consequences.",
  drama: "Pouring something rich, heavy, and probably emotionally expensive.",
  crime: "Following the money, the bodies, and the lie that starts it all.",
  action: "Revving the engines. Structural integrity is about to become optional.",
  fantasy: "Opening a portal to somewhere much better dressed than reality.",
  documentary: "Gathering the real stories worth your whole evening.",
};

const MOOD: Record<string, string> = {
  chill: "Finding something easy to melt into. No friction, no homework.",
  energetic: "Matching your energy with something fast, sharp, and alive.",
  emotional: "Picking something that knows exactly where the rib cage is.",
  dark: "Descending into the good kind of bleak.",
  funny: "Hunting down the stuff that's actually funny, not just loud.",
  surprise: "You've handed over the aux cord. Dangerous confidence.",
};

const GENERIC = [
  "Consulting the ratings, the vibe, and our better judgment.",
  "Ranking the greats now. Mediocrity is still not invited.",
  "Checking which excellent decisions are actually streamable tonight.",
];

export function buildLoadingCues(prefs: UserPreferences): string[] {
  const cues: string[] = [];
  const genres = prefs.genres;
  const subgenres = new Set(prefs.subgenres);

  if (genres.includes("horror") && genres.includes("romance") && subgenres.has("slasher")) {
    cues.push("Oh, so we're in a deadly, a-little-slutty romantic mood tonight. Noted.");
  }

  for (let i = 0; i < genres.length && cues.length < 2; i++) {
    for (let j = i + 1; j < genres.length; j++) {
      const combo = COMBOS[key(genres[i], genres[j])];
      if (combo) {
        cues.push(combo);
        break;
      }
    }
  }

  if (subgenres.has("slasher")) {
    cues.push("A slasher request. So we're rewarding terrible choices and sharp objects.");
  } else if (subgenres.has("romcom")) {
    cues.push("Rom-com specifics received. We are curating chemistry, not just kissing.");
  } else if (subgenres.has("psychological")) {
    cues.push("Psychological mode selected. Everyone is lying and that's exactly the point.");
  }

  if (genres[0] && GENRE[genres[0]]) cues.push(GENRE[genres[0]]);
  if (prefs.mood && MOOD[prefs.mood]) cues.push(MOOD[prefs.mood]);

  if (prefs.recent_loves.length > 0) {
    cues.push(`Cross-referencing tonight's vibe with your ${prefs.recent_loves[0]} taste profile.`);
  }

  if (prefs.origin === "indian" || prefs.origin === "both") {
    cues.push("Pulling in Indian picks that fit the mood, not just whatever is trending.");
  }

  if (prefs.time === "20-30m") {
    cues.push("Keeping it tight. No three-hour masterpieces when you asked for a quick hit.");
  }

  cues.push(...GENERIC);

  return [...new Set(cues)].slice(0, 5);
}
