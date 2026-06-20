import { PopcornGlyph } from "../ThemeChrome";

interface Props {
  onStart: () => void;
  onOpenWatchlist: () => void;
}

const LEFT_RAIL = [
  { src: "/posters/obsession_ver2.jpg", alt: "Obsession poster" },
  { src: "/posters/aashiqui_two.jpg", alt: "Aashiqui 2 poster" },
  { src: "/posters/marty_supreme_ver2.jpg", alt: "Marty Supreme poster" },
];

const RIGHT_RAIL = [
  { src: "/posters/house_of_the_dragon.jpg", alt: "House of the Dragon poster" },
  { src: "/posters/om_shanti_om_ver4.jpg", alt: "Om Shanti Om poster" },
  { src: "/posters/tumbbad.jpg", alt: "Tumbbad poster" },
];

function PreviewRow({
  rank,
  badge,
  rating,
  highlighted,
}: {
  rank: string;
  badge: string;
  rating: string;
  highlighted?: boolean;
}) {
  const badgeStyle =
    badge === "MASTERPIECE"
      ? {
          backgroundColor: "var(--masterpiece-fill)",
          color: "var(--masterpiece)",
          boxShadow: "inset 0 0 0 1px var(--masterpiece-ring)",
        }
      : {
          backgroundColor: "var(--great-fill)",
          color: "var(--rating)",
          boxShadow: "inset 0 0 0 1px var(--great-ring)",
        };

  return (
    <div className="flex items-center gap-4 border-t border-hairline px-1 py-4 first:border-t-0">
      <span className={`w-6 font-mono text-xs ${highlighted ? "text-accent" : "text-ink-mute"}`}>{rank}</span>
      <div className="poster-placeholder h-[72px] w-12 rounded-[6px]" />
      <div className="min-w-0 flex-1">
        <div className={`title-bar ${highlighted ? "animate-shimmer" : ""} w-[72%]`} />
        <div className="sub-bar mt-2 w-[48%]" />
        <span
          className="mt-3 inline-block rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]"
          style={badgeStyle}
        >
          {badge}
        </span>
      </div>
      <div className={`font-mono text-[24px] font-semibold text-rating ${highlighted ? "dot-pulse" : ""}`}>
        {rating}
      </div>
    </div>
  );
}

function RankedPreviewCard() {
  return (
    <section className="card-hover rounded-sheet border border-hairline bg-surface px-5 pb-3 pt-5 shadow-card">
      <div className="flex items-end justify-between gap-3">
        <h3 className="font-serif text-[19px] font-semibold text-ink">Your picks</h3>
        <span className="eyebrow text-ink-mute">Ranked by rating</span>
      </div>
      <div className="mt-3">
        <PreviewRow rank="01" badge="MASTERPIECE" rating="8.9" highlighted />
        <PreviewRow rank="02" badge="GREAT" rating="8.4" />
        <PreviewRow rank="03" badge="GREAT" rating="8.1" />
      </div>
    </section>
  );
}

function RailColumn({
  items,
  animation,
}: {
  items: Array<{ src: string; alt: string }>;
  animation: string;
}) {
  return (
    <div className={`flex w-[152px] flex-col gap-[18px] ${animation}`}>
      {items.map((item) => (
        <div key={item.src} className="overflow-hidden rounded-card border border-hairline shadow-card">
          <img src={item.src} alt={item.alt} className="aspect-[2/3] w-full object-cover" loading="eager" />
        </div>
      ))}
    </div>
  );
}

export default function LandingPage({ onStart, onOpenWatchlist }: Props) {
  return (
    <div className="pb-16">
      <section className="mx-auto grid min-h-[620px] max-w-[1180px] gap-10 px-4 py-10 sm:px-8 lg:grid-cols-[1.04fr_0.96fr] lg:px-10 lg:py-12">
        <div className="relative z-[2] flex flex-col justify-center gap-7 py-2">
          <p className="eyebrow text-accent">The Best, First</p>
          <h1 className="max-w-[11ch] font-serif text-[3.4rem] font-medium lowercase leading-none tracking-[-0.025em] text-ink sm:text-[4.7rem]">
            the best-rated pick, <span className="text-rating">every single night.</span>
          </h1>
          <p className="max-w-[440px] text-[17px] leading-8 text-ink-dim">
            Movietonite cuts through the endless scroll. Tell us the mood, the time, and the genres you
            want. We rank the strongest picks first and give you an honest case for each one.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onStart}
              className="rounded-full bg-accent px-6 py-3 text-[15px] font-semibold text-accent-ink shadow-card transition hover:scale-[1.03] hover:bg-accent-strong"
            >
              What should I watch?
            </button>
            <button
              onClick={onOpenWatchlist}
              className="rounded-full border border-hairline bg-surface px-5 py-3 text-[15px] font-medium text-ink-dim transition hover:text-ink"
            >
              Open watchlist
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-ink-mute">
            <span>IMDb</span>
            <span style={{ opacity: 0.7 }}>·</span>
            <span>Letterboxd</span>
            <span style={{ opacity: 0.7 }}>·</span>
            <span>Metacritic</span>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[28px] border border-hairline bg-surface">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-[2] w-1/2" style={{ background: "linear-gradient(90deg, var(--bg) 0%, color-mix(in srgb, var(--bg) 78%, transparent) 24%, transparent 62%)" }} />
          <div className="absolute inset-0">
            <PopcornGlyph size={34} className="absolute left-[12%] top-[14%] opacity-75 animate-pop-a" />
            <PopcornGlyph size={24} className="absolute right-[14%] top-[20%] opacity-60 animate-pop-b" />
            <PopcornGlyph size={20} className="absolute bottom-[12%] left-[28%] opacity-55 animate-pop-a" />
          </div>
          <div className="absolute inset-y-[-40px] right-[-42px] flex rotate-[-7deg] gap-[18px]">
            <RailColumn items={LEFT_RAIL} animation="animate-rail-a" />
            <div className="-mt-10">
              <RailColumn items={RIGHT_RAIL} animation="animate-rail-b" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-6 grid max-w-[1180px] gap-10 border-t border-hairline px-4 pt-12 sm:px-8 lg:grid-cols-[0.82fr_1.18fr] lg:px-10">
        <div>
          <p className="eyebrow text-accent">Ranked Best-First</p>
          <h2 className="mt-3 max-w-[12ch] font-serif text-[30px] font-medium leading-[1.08] text-ink">
            the good stuff floats to the top.
          </h2>
          <p className="mt-4 max-w-md text-[15px] leading-7 text-ink-dim">
            The product promise is simple: no “new and mediocre” feed. We bias toward the highest-rated
            matches, drop the weak stuff below your floor, and explain why each pick deserves your night.
          </p>
        </div>
        <RankedPreviewCard />
      </section>

      <section
        id="how-it-works"
        className="mx-auto mt-12 max-w-[1180px] border-t border-hairline px-4 pt-12 sm:px-8 lg:px-10"
      >
        <div className="grid gap-10 lg:grid-cols-3 lg:gap-11">
          {[
            {
              number: "01",
              title: "Tell us the vibe",
              copy: "Mood, time on hand, genres you love. Sixty seconds, no account.",
              accent: true,
            },
            {
              number: "02",
              title: "Quality floor first",
              copy: "A composite, IMDb-weighted score sorts the best up and drops the mediocre.",
            },
            {
              number: "03",
              title: "A case for each",
              copy: "Every pick comes with a short, honest argument for your night.",
            },
          ].map((item) => (
            <article key={item.number} className="pt-5" style={{ borderTop: `2px solid ${item.accent ? "var(--accent)" : "var(--hairline)"}` }}>
              <p className="font-mono text-[28px] font-semibold text-ink">{item.number}</p>
              <h3 className="mt-3 text-[18px] font-semibold text-ink">{item.title}</h3>
              <p className="mt-3 max-w-sm text-[15px] leading-7 text-ink-dim">{item.copy}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
