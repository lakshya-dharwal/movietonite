import { useEffect, useState } from "react";

type Theme = "dark" | "light";

const STORAGE_KEY = "mt-theme";

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "dark" || saved === "light") return saved;
    } catch {
      /* ignore */
    }
    return "dark";
  });

  useEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  return { theme, setTheme };
}

export function ThemeToggle({
  theme,
  setTheme,
}: {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}) {
  return (
    <div className="flex items-center gap-0.5 rounded-full border border-hairline bg-surface p-[3px]">
      <button
        type="button"
        aria-pressed={theme === "light"}
        onClick={() => setTheme("light")}
        title="Light mode"
        className={
          "rounded-full px-2.5 py-1 text-[13px] transition-colors " +
          (theme === "light"
            ? "bg-surface-2 text-accent"
            : "bg-transparent text-ink-mute hover:text-ink-dim")
        }
      >
        ☀
      </button>
      <button
        type="button"
        aria-pressed={theme === "dark"}
        onClick={() => setTheme("dark")}
        title="Dark mode"
        className={
          "rounded-full px-2.5 py-1 text-[13px] transition-colors " +
          (theme === "dark"
            ? "bg-surface-2 text-rating"
            : "bg-transparent text-ink-mute hover:text-ink-dim")
        }
      >
        ☾
      </button>
    </div>
  );
}

export function PopcornStripe() {
  return <div className="h-1.5 w-full" style={{ background: "var(--stripe)" }} />;
}

export function PopcornGlyph({
  size = 22,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  const lobes = [
    { width: "46%", height: "50%", top: "0", left: "27%", background: "#fbefce" },
    { width: "44%", height: "46%", top: "22%", left: "0", background: "#f6e4b8" },
    { width: "44%", height: "46%", top: "26%", left: "54%", background: "#fff7e0" },
    { width: "40%", height: "42%", top: "50%", left: "28%", background: "#f1d9a6" },
  ];

  return (
    <span
      className={`relative inline-block ${className}`}
      style={{ width: size, height: size * 0.9 }}
      aria-hidden="true"
    >
      {lobes.map((lobe, index) => (
        <span
          // Pure CSS mark from the design handoff. One span per popcorn lobe.
          key={index}
          style={{
            position: "absolute",
            width: lobe.width,
            height: lobe.height,
            top: lobe.top,
            left: lobe.left,
            background: lobe.background,
            borderRadius: "50%",
          }}
        />
      ))}
    </span>
  );
}
