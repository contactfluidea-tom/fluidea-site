import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0A0A0F",
        surface: "#14141B",
        primary: {
          DEFAULT: "#FF6B2C",
          soft: "#FF9A3D",
        },
        glow: "#FFB347",
        text: {
          DEFAULT: "#F5F5F7",
          muted: "#A0A0AB",
        },
      },
      fontFamily: {
        // Titres
        display: ["var(--font-sora)", ...fontFamily.sans],
        // Corps de texte (défaut)
        sans: ["var(--font-inter)", ...fontFamily.sans],
      },
      // Échelle typographique fluide (clamp) pour les titres
      fontSize: {
        "display-sm": [
          "clamp(1.75rem, 1.1rem + 2.6vw, 2.5rem)",
          { lineHeight: "1.15", letterSpacing: "-0.02em" },
        ],
        "display-md": [
          "clamp(2.25rem, 1.4rem + 3.6vw, 3.5rem)",
          { lineHeight: "1.1", letterSpacing: "-0.025em" },
        ],
        "display-lg": [
          "clamp(2.75rem, 1.3rem + 6vw, 4.75rem)",
          { lineHeight: "1.05", letterSpacing: "-0.03em" },
        ],
        "display-xl": [
          "clamp(3.25rem, 0.8rem + 9.5vw, 6.5rem)",
          { lineHeight: "1", letterSpacing: "-0.035em" },
        ],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },
      // Ombres lumineuses orange
      boxShadow: {
        "glow-sm": "0 0 12px -2px rgba(255, 107, 44, 0.35)",
        "glow-md": "0 0 28px -4px rgba(255, 107, 44, 0.45)",
        "glow-lg": "0 0 60px -8px rgba(255, 107, 44, 0.55)",
      },
      // Dégradé de marque
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #FF6B2C, #FF9A3D)",
      },
    },
  },
  plugins: [],
};
export default config;
