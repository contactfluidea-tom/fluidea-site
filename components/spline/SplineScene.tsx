"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import {
  Component,
  Suspense,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { SplineProps } from "@splinetool/react-spline";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useMediaQuery } from "@/hooks/useMediaQuery";

/** Scène par défaut (paramétrable via `NEXT_PUBLIC_FAQ_SPLINE_URL` ou la prop `url`). */
const DEFAULT_SCENE_URL =
  process.env.NEXT_PUBLIC_FAQ_SPLINE_URL ??
  "https://prod.spline.design/XCkzCgkJK37ndXZz/scene.splinecode";

// La 3D Spline est chargée uniquement côté client (WebGL) et à la demande, pour
// ne peser ni sur le SSR ni sur le SEO.
const Spline = dynamic<SplineProps>(
  () => import("@splinetool/react-spline").then((mod) => mod.default),
  { ssr: false, loading: () => <SplineLoader /> }
);

/**
 * Garde-fou : si l'initialisation WebGL/Spline échoue (appareil sans WebGL,
 * réseau, contexte perdu…), on retombe sur le fond d'ambiance branché, sans
 * jamais casser la page.
 */
class SplineBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/** Loader discret : halo orange pulsant (respecte `prefers-reduced-motion` via le CSS global). */
function SplineLoader() {
  return (
    <div className="absolute inset-0 grid place-items-center" aria-hidden="true">
      <span className="h-24 w-24 animate-pulse rounded-full bg-primary/20 blur-2xl" />
    </div>
  );
}

/**
 * Fond d'ambiance branché (dark + halos orange #FF6B2C / #FFB347), harmonisé
 * avec le décor du Hero. Sert de poster statique sur mobile / `reduced-motion`,
 * de fond de chargement et de repli en cas d'échec de la 3D. Si une image
 * `poster` est fournie, elle est affichée par-dessus le dégradé.
 */
function Ambiance({ poster, posterAlt }: { poster?: string; posterAlt?: string }) {
  return (
    <div className="absolute inset-0" aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 60% at 72% 28%, rgba(255,107,44,0.28), transparent 70%)," +
            "radial-gradient(40% 50% at 88% 62%, rgba(255,179,71,0.16), transparent 72%)",
        }}
      />
      {poster ? (
        <Image
          src={poster}
          alt={posterAlt ?? ""}
          fill
          sizes="100vw"
          priority={false}
          className="object-cover opacity-60"
        />
      ) : null}
    </div>
  );
}

export interface SplineSceneProps {
  /** URL `.splinecode`. Défaut : `NEXT_PUBLIC_FAQ_SPLINE_URL` puis valeur codée. */
  url?: string;
  /** Image de repli (mobile / reduced-motion / échec). Optionnelle. */
  poster?: string;
  posterAlt?: string;
  className?: string;
}

/**
 * Élément d'ambiance 3D Spline, non-interactif, à placer en arrière-plan.
 * Chargé en lazy côté client ; remplacé par un poster/dégradé sur mobile et en
 * `prefers-reduced-motion` (aucun WebGL chargé alors). Le runtime Spline est
 * libéré au démontage du composant dynamique.
 */
export function SplineScene({
  url = DEFAULT_SCENE_URL,
  poster,
  posterAlt,
  className,
}: SplineSceneProps) {
  const reducedMotion = useReducedMotion();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [mounted, setMounted] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // On ne décide du rendu (live vs poster) qu'après le premier rendu client,
  // une fois le contexte (mobile / reduced-motion) connu.
  useEffect(() => setMounted(true), []);

  const simplified = isMobile || reducedMotion;
  const showLive = mounted && !simplified;

  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      aria-hidden="true"
    >
      {/* Fond d'ambiance : toujours présent (poster de base + repli de chargement). */}
      <Ambiance poster={poster} posterAlt={posterAlt} />

      {showLive ? (
        <SplineBoundary fallback={null}>
          <Suspense fallback={<SplineLoader />}>
            <div
              className={cn(
                "absolute inset-0 transition-opacity duration-700",
                loaded ? "opacity-100" : "opacity-0"
              )}
            >
              <Spline
                scene={url}
                onLoad={() => setLoaded(true)}
                renderOnDemand={false}
                style={{ width: "100%", height: "100%" }}
              />
            </div>
          </Suspense>
        </SplineBoundary>
      ) : null}
    </div>
  );
}

export default SplineScene;
