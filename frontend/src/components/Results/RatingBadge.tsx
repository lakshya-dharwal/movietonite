interface Props {
  badge: string;
}

// Gold is reserved exclusively for MASTERPIECE; everything else uses emerald.
export default function RatingBadge({ badge }: Props) {
  const isMasterpiece = badge === "MASTERPIECE";
  return (
    <span
      className={
        "inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider " +
        (isMasterpiece
          ? "bg-gold/15 text-gold ring-1 ring-gold/40"
          : "bg-emerald/10 text-emerald ring-1 ring-emerald/30")
      }
    >
      {badge}
    </span>
  );
}
