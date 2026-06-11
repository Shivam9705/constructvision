import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-dm-sans)", "sans-serif"],
        display: ["var(--font-dm-serif)", "serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      colors: {
        brand: {
          50:  "#fff8ed",
          100: "#ffeed4",
          200: "#ffd9a8",
          300: "#ffbc71",
          400: "#ff9538",
          500: "#ff7510",
          600: "#f05a06",
          700: "#c74307",
          800: "#9e340e",
          900: "#7f2d0f",
          950: "#451305",
        },
        concrete: {
          50:  "#f6f5f4",
          100: "#e8e6e3",
          200: "#d2ceca",
          300: "#b5afa9",
          400: "#928b83",
          500: "#7a7269",
          600: "#665f57",
          700: "#544e48",
          800: "#474239",
          900: "#3d3832",
          950: "#201e1b",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
