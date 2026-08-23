/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        window: "var(--breeze-window)",
        view: "var(--breeze-view)",
        chrome: "var(--breeze-chrome)",
        text: "var(--breeze-text)",
        subtle: "var(--breeze-subtle)",
        line: "var(--breeze-line)",
        hover: "var(--breeze-hover)",
        "panel-tint": "var(--breeze-panel-tint)",
        accent: "var(--breeze-accent)",
        "accent-strong": "var(--breeze-accent-strong)",
        "accent-fg": "var(--breeze-accent-fg)",
        negative: "var(--breeze-negative)",
        positive: "var(--breeze-positive)",
      },
      fontFamily: {
        sans: [
          '"Noto Sans"',
          '"Noto Sans KR"',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          'ui-monospace',
          '"JetBrains Mono"',
          '"Cascadia Code"',
          '"Fira Code"',
          'Menlo',
          'Consolas',
          'monospace',
        ],
      },
      borderRadius: {
        window: "10px",
        panel: "18px",
      },
      boxShadow: {
        window: "0 14px 42px -8px var(--breeze-shadow-xl), 0 3px 12px -2px var(--breeze-shadow)",
        "window-unfocused": "0 8px 26px -10px var(--breeze-shadow-xl), 0 2px 8px -2px var(--breeze-shadow)",
        panel: "0 10px 34px -6px var(--breeze-shadow-xl), 0 2px 10px -2px var(--breeze-shadow)",
        popup: "0 12px 36px -6px var(--breeze-shadow-xl), 0 3px 12px -2px var(--breeze-shadow)",
      },
    },
  },
  plugins: [],
};
