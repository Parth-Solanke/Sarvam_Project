/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        workbench: {
          bg: "var(--wb-bg)",
          surface: "var(--wb-surface)",
          panel: "var(--wb-panel)",
          panelAlt: "var(--wb-panel-alt)",
          border: "var(--wb-border)",
          borderSubtle: "var(--wb-border-subtle)",
          hover: "var(--wb-hover)",
          muted: "var(--wb-muted)",
          text: "var(--wb-text)",
          textBright: "var(--wb-text-bright)",
          accent: "var(--wb-accent)",
          cyan: "var(--wb-cyan)",
          warning: "var(--wb-warning)",
          danger: "var(--wb-danger)",
          success: "var(--wb-success)",
          purple: "var(--wb-purple)",
        },
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Fira Code", "ui-monospace", "SFMono-Regular", "monospace"],
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      animation: {
        "pulse-subtle": "pulseSubtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.2s ease-in-out",
      },
      keyframes: {
        pulseSubtle: {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.6 },
        },
        fadeIn: {
          from: { opacity: 0, transform: "scale(0.98)" },
          to: { opacity: 1, transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};
