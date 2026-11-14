/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--pc-font-sans)"],
      },
      colors: {
        canvas: "var(--pc-canvas)",
        surface: "var(--pc-surface)",
        line: {
          DEFAULT: "var(--pc-border)",
          soft: "var(--pc-border-soft)",
        },
        ink: {
          900: "var(--pc-ink-900)",
          700: "var(--pc-ink-700)",
          500: "var(--pc-ink-500)",
        },
      },
      maxWidth: {
        ficha: "var(--pc-container)",
      },
      borderRadius: {
        card: "var(--pc-radius-card)",
        control: "var(--pc-radius-control)",
      },
      boxShadow: {
        card: "var(--pc-shadow-card)",
        ambient: "var(--pc-shadow-ambient)",
      },
      fontSize: {
        display: [
          "var(--pc-text-display)",
          { lineHeight: "1.08", letterSpacing: "-0.02em" },
        ],
        section: ["var(--pc-text-section)", { lineHeight: "1.4" }],
        meta: ["var(--pc-text-meta)", { lineHeight: "1.5" }],
        body: ["var(--pc-text-body)", { lineHeight: "1.65" }],
        value: ["var(--pc-text-value)", { lineHeight: "1.35" }],
      },
    },
  },
  plugins: [],
};
