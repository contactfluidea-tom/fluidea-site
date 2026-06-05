"use client";

import dynamic from "next/dynamic";
import {
  Component,
  useCallback,
  useEffect,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import { motion, type Variants } from "framer-motion";
import { LuArrowRight, LuChevronDown, LuSparkles } from "react-icons/lu";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useLenis } from "@/components/layout/SmoothScrollProvider";

// La scène 3D est chargée uniquement côté client (pas de SSR) et seulement
// quand le Hero est monté, pour éviter tout coût serveur/SEO inutile.
const AutomationScene = dynamic(
  () => import("@/components/three/AutomationScene"),
  { ssr: false, loading: () => null }
);

/**
 * Garde-fou : si l'initialisation WebGL échoue (appareil sans WebGL, contexte
 * perdu…), on retombe simplement sur le fond en dégradé, sans casser la page.
 */
class SceneBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * Section Hero de la page d'accueil : décor 3D (réseau d'automatisation n8n)
 * en arrière-plan, sur-titre, grand titre avec mot-clé en dégradé, sous-titre,
 * deux CTA et un indicateur de scroll animé. Le contenu apparaît en
 * fondu/translation au chargement. Entièrement responsive et accessible
 * (respect de `prefers-reduced-motion`, version allégée/statique sur mobile).
 */
export function Hero() {
  const reducedMotion = useReducedMotion();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const lenis = useLenis();

  // La scène n'est montée qu'après le premier rendu client : on connaît alors
  // déjà le contexte (mobile / reduced-motion) pour choisir la bonne version.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const simplified = isMobile || reducedMotion;

  const scrollTo = useCallback(
    (event: MouseEvent<HTMLElement>, href: string) => {
      event.preventDefault();
      if (lenis) {
        lenis.scrollTo(href, { offset: -80 });
      } else {
        document.querySelector(href)?.scrollIntoView({
          behavior: reducedMotion ? "auto" : "smooth",
          block: "start",
        });
      }
    },
    [lenis, reducedMotion]
  );

  const container: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reducedMotion ? 0 : 0.12,
        delayChildren: reducedMotion ? 0 : 0.15,
      },
    },
  };

  const item: Variants = reducedMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.3 } } }
    : {
        hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
        visible: {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
        },
      };

  return (
    <section
      id="hero"
      aria-labelledby="hero-title"
      className="relative flex min-h-[100svh] w-full items-center overflow-hidden"
    >
      {/* Décor 3D + voiles de lisibilité (jamais interactifs) */}
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
        {mounted && (
          <SceneBoundary>
            <AutomationScene simplified={simplified} />
          </SceneBoundary>
        )}
        {/* Scrim latéral : assombrit la gauche pour la lisibilité du texte */}
        <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/70 to-transparent sm:via-bg/55" />
        {/* Fondu vers le bas pour raccorder à la section suivante */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-bg" />
      </div>

      <Container className="relative z-10 py-28 sm:py-32">
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="flex max-w-2xl flex-col items-start gap-6 text-left"
        >
          <motion.div variants={item}>
            <Badge icon={<LuSparkles />}>Automatisation IA sur-mesure</Badge>
          </motion.div>

          <motion.h1
            id="hero-title"
            variants={item}
            className="font-display text-display-lg font-semibold tracking-tight text-text"
          >
            <span className="text-gradient">Automatiser</span> votre façon de
            travailler.
          </motion.h1>

          <motion.p
            variants={item}
            className="max-w-xl text-base text-text-muted sm:text-lg"
          >
            Fluidea conçoit des automatisations IA qui transforment votre temps
            en résultats — votre activité tourne bien, imaginez ce que
            l&apos;IA peut en faire.
          </motion.p>

          <motion.div
            variants={item}
            className="mt-2 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center"
          >
            <Button
              href="#reservation"
              size="lg"
              rightIcon={<LuArrowRight />}
              onClick={(event) => scrollTo(event, "#reservation")}
              className="w-full sm:w-auto"
            >
              Réserver un audit
            </Button>
            <Button
              href="#realisations"
              size="lg"
              variant="secondary"
              magnetic={false}
              onClick={(event) => scrollTo(event, "#realisations")}
              className="w-full sm:w-auto"
            >
              Voir nos réalisations
            </Button>
          </motion.div>
        </motion.div>
      </Container>

      {/* Indicateur de scroll */}
      <motion.a
        href="#process"
        onClick={(event) => scrollTo(event, "#process")}
        aria-label="Faire défiler vers la section suivante"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reducedMotion ? 0 : 1.1, duration: 0.6 }}
        className="group absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 rounded-full p-2 text-text-muted transition-colors hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
      >
        <span className="text-xs font-medium uppercase tracking-[0.2em]">
          Découvrir
        </span>
        <span className="relative flex h-9 w-5 items-start justify-center rounded-full border-2 border-text-muted/50 p-1">
          <motion.span
            className="h-1.5 w-1.5 rounded-full bg-primary"
            animate={reducedMotion ? undefined : { y: [0, 9, 0], opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        </span>
        <LuChevronDown aria-hidden="true" className="-mt-1 h-4 w-4 opacity-70" />
      </motion.a>
    </section>
  );
}
