/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        ink: "var(--ink)",
        "ink-dim": "var(--ink-dim)",
        "ink-mute": "var(--ink-mute)",
        hairline: "var(--hairline)",
        accent: "var(--accent)",
        "accent-strong": "var(--accent-strong)",
        "accent-ink": "var(--accent-ink)",
        rating: "var(--rating)",
        masterpiece: "var(--masterpiece)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["Fraunces", "Georgia", "serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
      },
      borderRadius: { card: "10px", sheet: "16px" },
      boxShadow: {
        card: "var(--shadow-card)",
        "card-hover": "var(--shadow-card-hover)",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmerBar: {
          from: { backgroundPosition: "200% 0" },
          to: { backgroundPosition: "-200% 0" },
        },
        dotPulse: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.45" },
          "50%": { transform: "scale(1.45)", opacity: "1" },
        },
        floatRailA: {
          from: { transform: "translateY(0)" },
          to: { transform: "translateY(-30px)" },
        },
        floatRailB: {
          from: { transform: "translateY(0)" },
          to: { transform: "translateY(32px)" },
        },
        ctaPulseRed: {
          "0%": { boxShadow: "0 0 0 0 rgba(216,53,43,0.32)" },
          "70%": { boxShadow: "0 0 0 16px rgba(216,53,43,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(216,53,43,0)" },
        },
        popA: {
          from: { transform: "translateY(0) rotate(-9deg)" },
          to: { transform: "translateY(-18px) rotate(7deg)" },
        },
        popB: {
          from: { transform: "translateY(0) rotate(6deg)" },
          to: { transform: "translateY(15px) rotate(-8deg)" },
        },
      },
      animation: {
        "fade-in": "fadeIn 0.35s ease both",
        shimmer: "shimmerBar 1.9s linear infinite",
        "dot-pulse": "dotPulse 2s ease-in-out infinite",
        "rail-a": "floatRailA 9s ease-in-out infinite alternate",
        "rail-b": "floatRailB 11s ease-in-out infinite alternate",
        "cta-pulse": "ctaPulseRed 3.6s ease-out infinite",
        "pop-a": "popA 7s ease-in-out infinite alternate",
        "pop-b": "popB 9s ease-in-out infinite alternate",
      },
    },
  },
  plugins: [],
};
