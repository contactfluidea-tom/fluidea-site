import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo";

/**
 * Manifeste PWA (thème sombre Fluidea). Icônes 192/512 issues de l'emblème
 * orange (carré dégradé), servies depuis `public/`.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Fluidea",
    short_name: "Fluidea",
    description: SITE.description,
    start_url: "/",
    display: "standalone",
    background_color: "#0A0A0F",
    theme_color: "#0A0A0F",
    lang: "fr",
    icons: [
      { src: "/favicon.ico", sizes: "16x16 32x32 48x48", type: "image/x-icon" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
