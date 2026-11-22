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
        accent: {
          trainers: "#DC2626",
          gifts: "#F59E0B",
          recovery: "#7C3AED",
        },
      },
      maxWidth: {
        ficha: "var(--pc-container)",
        home: "var(--pc-container-home)",
      },
      borderRadius: {
        card: "22px",
        control: "13px",
      },
      boxShadow: {
        card: "var(--pc-shadow-card)",
        ambient: "var(--pc-shadow-ambient)",
        soft: "0 4px 20px -6px rgb(0 0 0 / 0.08)",
        lift: "0 14px 34px -10px rgb(0 0 0 / 0.18)",
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
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "none" },
        },
        pop: {
          "50%": { transform: "scale(1.12)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-5px)" },
          "75%": { transform: "translateX(5px)" },
        },
      },
      animation: {
        "fade-up": "fade-up .2s ease-out",
        pop: "pop .35s ease-out",
        shake: "shake .3s ease-in-out",
      },
    },
  },
  plugins: [],
};
