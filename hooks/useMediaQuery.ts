"use client";

import { useEffect, useState } from "react";

/**
 * Indique si une media query CSS est satisfaite (ex. `(max-width: 768px)`).
 *
 * Renvoie `false` côté serveur et au premier rendu (avant hydratation), puis
 * se synchronise avec la vraie valeur dès le montage et réagit en direct aux
 * changements (redimensionnement, rotation de l'appareil…).
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches);
    mediaQuery.addEventListener("change", onChange);
    return () => mediaQuery.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}
