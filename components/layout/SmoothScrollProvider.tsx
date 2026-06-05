"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import Lenis from "@studio-freight/lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const LenisContext = createContext<Lenis | null>(null);

/**
 * Donne accès à l'instance Lenis active, ou `null` si le smooth scroll est
 * désactivé (reduced-motion, ou avant le montage). Utile pour déclencher des
 * défilements programmés (`lenis.scrollTo(...)`) ou suspendre le scroll.
 */
export function useLenis(): Lenis | null {
  return useContext(LenisContext);
}

interface SmoothScrollProviderProps {
  children: ReactNode;
}

/**
 * Active le smooth scroll Lenis et le synchronise avec GSAP ScrollTrigger
 * (une seule boucle RAF pilotée par le ticker GSAP). L'instance est exposée
 * via le contexte (voir {@link useLenis}).
 *
 * Entièrement désactivé si l'utilisateur préfère réduire les animations :
 * on conserve alors le scroll natif du navigateur.
 */
export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const reducedMotion = useReducedMotion();
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    // Accessibilité : aucun scroll « assisté » si reduced-motion est actif.
    if (reducedMotion) return;

    gsap.registerPlugin(ScrollTrigger);

    const instance = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    // Met à jour ScrollTrigger à chaque frame de scroll Lenis.
    instance.on("scroll", ScrollTrigger.update);

    // Pilote Lenis depuis le ticker GSAP (time est en secondes → ms).
    const update = (time: number) => {
      instance.raf(time * 1000);
    };
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    setLenis(instance);

    return () => {
      gsap.ticker.remove(update);
      instance.off("scroll", ScrollTrigger.update);
      instance.destroy();
      setLenis(null);
    };
  }, [reducedMotion]);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}
