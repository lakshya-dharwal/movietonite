/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0F0F0F",
        surface: "#161616",
        "surface-2": "#1F1F1F",
        ink: "#F5F5F5",
        "ink-dim": "#B5B5B5",
        emerald: "#2FD3A5",
        gold: "#E6C36B",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["Fraunces", "Georgia", "serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
      },
      borderRadius: { card: "10px", sheet: "16px" },
      boxShadow: {
        card: "0 4px 16px rgba(0,0,0,0.45)",
        "card-hover": "0 8px 28px rgba(0,0,0,0.55)",
      },
    },
  },
  plugins: [],
};
