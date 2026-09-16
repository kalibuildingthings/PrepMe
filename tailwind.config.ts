import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f2f6ff",
          100: "#e6edff",
          200: "#c3d3ff",
          300: "#9fb9ff",
          400: "#5c85ff",
          500: "#1a52ff",
          600: "#1442db",
          700: "#0f33ab",
          800: "#0a2478",
          900: "#061745",
        },
        ink: "#0b0d17",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      keyframes: {
        pulseRing: {
          "0%": { transform: "scale(0.9)", opacity: "0.7" },
          "70%": { transform: "scale(1.4)", opacity: "0" },
          "100%": { transform: "scale(1.4)", opacity: "0" },
        },
      },
      animation: {
        pulseRing: "pulseRing 1.8s cubic-bezier(0.2,0.6,0.4,1) infinite",
      },
    },
  },
  plugins: [],
};
export default config;
