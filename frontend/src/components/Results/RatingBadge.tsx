interface Props {
  badge: string;
}

export default function RatingBadge({ badge }: Props) {
  const isMasterpiece = badge === "MASTERPIECE";
  return (
    <span
      className="inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em]"
      style={
        isMasterpiece
          ? {
              backgroundColor: "var(--masterpiece-fill)",
              color: "var(--masterpiece)",
              boxShadow: "inset 0 0 0 1px var(--masterpiece-ring)",
            }
          : {
              backgroundColor: "var(--great-fill)",
              color: "var(--rating)",
              boxShadow: "inset 0 0 0 1px var(--great-ring)",
            }
      }
    >
      {badge}
    </span>
  );
}
