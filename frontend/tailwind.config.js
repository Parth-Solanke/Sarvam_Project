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
          bg: "#0B0E14",
          surface: "#12161F",
          panel: "#181E29",
          border: "#262E3D",
          hover: "#222A3A",
          muted: "#6C7A92",
          text: "#E2E8F0",
          accent: "#388BFD",
          warning: "#F0883E",
          success: "#2EA043",
          danger: "#F85149",
          purple: "#A371F7",
          cyan: "#39C5BB"
        }
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Fira Code", "Courier New", "monospace"],
      }
    },
  },
  plugins: [],
};
