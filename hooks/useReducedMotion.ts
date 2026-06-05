"use client";

import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Indique si l'utilisateur a demandé à réduire les animations dans ses
 * préférences système. Réagit en direct aux changements de réglage.
 *
 * Renvoie `false` côté serveur et au premier rendu (avant hydratation),
 * puis se synchronise avec la vraie valeur dès le montage.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(QUERY);
    setReduced(mediaQuery.matches);

    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    mediaQuery.addEventListener("change", onChange);
    return () => mediaQuery.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
