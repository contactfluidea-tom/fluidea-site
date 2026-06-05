"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  type MouseEvent,
} from "react";
import type { IconType } from "react-icons";
import {
  LuArrowRight,
  LuBlocks,
  LuCompass,
  LuPenTool,
  LuRocket,
  LuRoute,
  LuTrendingUp,
} from "react-icons/lu";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useLenis } from "@/components/layout/SmoothScrollProvider";

// useLayoutEffect côté client, useEffect au rendu serveur (évite l'avertissement
// SSR de React) : on prépare l'animation GSAP avant la première peinture.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

interface ProcessStep {
  icon: IconType;
  title: string;
  description: string;
}

const STEPS: ProcessStep[] = [
  {
    icon: LuCompass,
    title: "Audit & découverte",
    description:
      "On clarifie vos objectifs et on cartographie vos process actuels pour repérer les tâches répétitives à fort potentiel d'automatisation.",
  },
  {
    icon: LuPenTool,
    title: "Conception du système",
    description:
      "On conçoit l'architecture de votre solution — logique d'automatisation, agents IA et connexions entre vos outils — validée avec vous avant le moindre développement.",
  },
  {
    icon: LuBlocks,
    title: "Implémentation & intégration",
    description:
      "On développe, connecte et teste chaque automatisation directement dans votre environnement, sans interrompre votre activité.",
  },
  {
    icon: LuTrendingUp,
    title: "Optimisation & suivi",
    description:
      "On mesure les résultats, on affine les workflows et on assure un suivi continu pour que votre système gagne en fiabilité au fil du temps.",
  },
];

/** Icône de l'étape dans un carré lumineux orange (réagit au survol de la carte). */
function StepIcon({ icon: Icon }: { icon: IconType }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
        "bg-primary/10 text-primary shadow-glow-sm ring-1 ring-primary/20",
        "transition-[background-color,box-shadow,transform] duration-300",
        "group-hover:scale-105 group-hover:bg-primary/15 group-hover:shadow-glow-md"
      )}
    >
      <Icon className="h-6 w-6" />
    </span>
  );
}

/**
 * Section « Process » : timeline verticale présentant les 4 étapes de la
 * méthode Fluidea. Une ligne lumineuse orange se remplit progressivement au
 * scroll (GSAP ScrollTrigger en mode `scrub`, lié à la progression), tandis que
 * chaque étape (point numéroté + carte) se révèle en entrant dans le viewport.
 *
 * Mise en page : sur desktop, les cartes alternent à gauche/droite d'une ligne
 * centrale ; sur mobile, elles s'empilent à droite d'une ligne placée à gauche.
 *
 * Accessibilité : liste ordonnée (`<ol>`) pour la sémantique des étapes, et
 * `gsap.matchMedia` respecte `prefers-reduced-motion` — sans mouvement autorisé,
 * la ligne reste pleine (statique) et toutes les étapes sont visibles d'emblée.
 */
export function Process() {
  const listRef = useRef<HTMLOListElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const reducedMotion = useReducedMotion();

  // Défilement doux vers la section réservation (CTA), comme dans Hero/Services.
  const scrollTo = useCallback(
    (event: MouseEvent<HTMLAnchorElement>, href: string) => {
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

  useIsomorphicLayoutEffect(() => {
    const list = listRef.current;
    const fill = fillRef.current;
    if (!list || !fill) return;

    gsap.registerPlugin(ScrollTrigger);

    const mm = gsap.matchMedia();
    // Tout est neutralisé si l'utilisateur préfère réduire les mouvements : la
    // ligne reste pleine (voir `h-full` du remplissage) et les étapes visibles.
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // 1) Remplissage de la ligne lié à la progression du scroll (scrub).
      gsap.fromTo(
        fill,
        { height: "0%" },
        {
          height: "100%",
          ease: "none",
          scrollTrigger: {
            trigger: list,
            start: "top 72%",
            end: "bottom 62%",
            scrub: 0.6,
          },
        }
      );

      // 2) Apparition de chaque étape (point + carte) en entrant dans le viewport.
      const steps = gsap.utils.toArray<HTMLLIElement>("[data-step]", list);
      steps.forEach((step) => {
        const node = step.querySelector("[data-node]");
        const card = step.querySelector("[data-card]");
        const tl = gsap.timeline({
          scrollTrigger: { trigger: step, start: "top 80%", once: true },
        });
        if (node) {
          tl.from(node, {
            scale: 0,
            autoAlpha: 0,
            duration: 0.5,
            ease: "back.out(1.7)",
          });
        }
        if (card) {
          tl.from(
            card,
            { y: 44, autoAlpha: 0, duration: 0.6, ease: "power3.out" },
            "-=0.25"
          );
        }
      });
    });

    return () => mm.revert();
  }, []);

  return (
    <Section id="process" aria-label="Comment ça marche">
      <Container>
        <SectionHeading
          eyebrow="Notre méthode"
          eyebrowIcon={<LuRoute />}
          title="Comment ça marche"
          subtitle="De l'audit au suivi, une méthode claire en 4 étapes pour transformer vos tâches répétitives en systèmes automatisés fiables."
        />

        <ol
          ref={listRef}
          className="relative mx-auto mt-14 max-w-5xl space-y-10 sm:mt-20 sm:space-y-14"
        >
          {/* Ligne verticale : rail discret + remplissage lumineux animé.
              À gauche sur mobile, centrée sur desktop. Les extrémités sont
              estompées (masque) pour une intégration douce, sans bord net. */}
          <div
            aria-hidden="true"
            className="absolute inset-y-0 left-[22px] w-px -translate-x-1/2 lg:left-1/2"
            style={{
              WebkitMaskImage:
                "linear-gradient(to bottom, transparent, #000 6%, #000 94%, transparent)",
              maskImage:
                "linear-gradient(to bottom, transparent, #000 6%, #000 94%, transparent)",
            }}
          >
            {/* Rail (portion non remplie) */}
            <div className="absolute inset-0 bg-white/10" />
            {/* Remplissage : hauteur animée au scroll ; pleine par défaut, donc
                statique si reduced-motion (GSAP ne s'exécute pas). */}
            <div
              ref={fillRef}
              className="absolute inset-x-0 top-0 h-full bg-gradient-to-b from-primary-soft via-primary to-primary shadow-[0_0_10px_rgba(255,107,44,0.55)]"
            >
              {/* Tête lumineuse en pointe du remplissage (seulement si animé). */}
              {!reducedMotion ? (
                <span className="absolute -bottom-1 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-glow shadow-[0_0_16px_5px_rgba(255,179,71,0.8)]" />
              ) : null}
            </div>
          </div>

          {STEPS.map((step, index) => {
            const isLeft = index % 2 === 0;
            const number = String(index + 1).padStart(2, "0");

            return (
              <li key={step.title} data-step className="relative">
                {/* Point numéroté posé sur la ligne, centré verticalement sur la
                    carte. Le `ring-bg` masque le rail derrière le point. */}
                <span
                  data-node
                  aria-hidden="true"
                  className={cn(
                    "absolute left-[22px] top-1/2 z-10 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2",
                    "items-center justify-center rounded-full lg:left-1/2",
                    "border border-primary/40 bg-surface font-display text-sm font-semibold text-primary-soft",
                    "shadow-glow-md ring-4 ring-bg"
                  )}
                >
                  {number}
                </span>

                {/* Connecteur horizontal point → carte (desktop, décoratif). */}
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute top-1/2 z-0 hidden h-px w-14 -translate-y-1/2 bg-primary/25 lg:block",
                    isLeft ? "right-1/2" : "left-1/2"
                  )}
                />

                {/* Carte de l'étape : décalée à droite de la ligne sur mobile,
                    alternée gauche/droite (collée à la ligne) sur desktop. */}
                <div
                  data-card
                  className={cn(
                    "pl-16 lg:pl-0",
                    isLeft
                      ? "lg:mr-[50%] lg:flex lg:justify-end lg:pr-14"
                      : "lg:ml-[50%] lg:pl-14"
                  )}
                >
                  <Card className="w-full lg:max-w-md">
                    {/* Halo discret intensifié au survol (cohérent avec Services). */}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                      style={{
                        background:
                          "radial-gradient(60% 55% at 50% 0%, rgba(255, 107, 44, 0.14), transparent 72%)",
                      }}
                    />
                    <div className="relative flex items-start gap-4">
                      <StepIcon icon={step.icon} />
                      <div className="flex flex-col gap-2">
                        <h3 className="font-display text-lg font-semibold text-text sm:text-xl">
                          {step.title}
                        </h3>
                        <p className="text-sm leading-relaxed text-text-muted">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </li>
            );
          })}
        </ol>

        {/* CTA final */}
        <div className="mt-16 flex flex-col items-center gap-3 sm:mt-20">
          <Button
            href="#reservation"
            onClick={(event) => scrollTo(event, "#reservation")}
            size="lg"
            leftIcon={<LuRocket />}
            rightIcon={<LuArrowRight />}
          >
            Démarrer mon projet
          </Button>
          <p className="text-sm text-text-muted">
            Audit offert · réponse sous 24&nbsp;h
          </p>
        </div>
      </Container>
    </Section>
  );
}
