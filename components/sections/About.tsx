"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  type MouseEvent,
} from "react";
import Image from "next/image";
import type { IconType } from "react-icons";
import {
  LuArrowRight,
  LuBrainCircuit,
  LuClock,
  LuHeartHandshake,
  LuMessagesSquare,
  LuPencilRuler,
  LuUserRound,
} from "react-icons/lu";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/Button";
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

interface Strength {
  icon: IconType;
  title: string;
  description: string;
}

/** Les 4 points forts mis en avant (avec icône). */
const STRENGTHS: Strength[] = [
  {
    icon: LuPencilRuler,
    title: "Sur-mesure",
    description:
      "Chaque système est pensé pour vos process — jamais une solution générique recyclée.",
  },
  {
    icon: LuBrainCircuit,
    title: "IA de pointe",
    description:
      "Les derniers modèles Claude et les meilleurs outils, au service de résultats concrets.",
  },
  {
    icon: LuClock,
    title: "Gain de temps",
    description:
      "Vos tâches répétitives tournent en autonomie et vous rendent des heures chaque semaine.",
  },
  {
    icon: LuHeartHandshake,
    title: "Accompagnement",
    description:
      "Un interlocuteur unique, de l'audit au suivi, qui reste disponible une fois le système livré.",
  },
];

interface MiniStat {
  value: string;
  label: string;
}

/**
 * Mini-statistiques (signaux de confiance). Volontairement distinctes des
 * compteurs d'impact de la section « Réalisations » : valeurs d'exemple à
 * ajuster — modifier `value`/`label` suffit.
 */
const MINI_STATS: MiniStat[] = [
  { value: "100k+", label: "dans la communauté" },
  { value: "100%", label: "sur-mesure" },
  { value: "24/7", label: "systèmes actifs" },
];

/** Pastille d'icône orange (cohérente avec Services / Process / Réalisations). */
function IconChip({ icon: Icon }: { icon: IconType }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
        "bg-primary/10 text-primary shadow-glow-sm ring-1 ring-primary/20",
        "transition-[background-color,box-shadow,transform] duration-300",
        "group-hover:scale-105 group-hover:bg-primary/15 group-hover:shadow-glow-md"
      )}
    >
      <Icon className="h-5 w-5" />
    </span>
  );
}

/**
 * Visuel de gauche : logo/photo de remplacement dans un cadre glassmorphism,
 * halo orange diffus, léger parallaxe au scroll (couche interne plus haute que
 * le cadre, translatée par GSAP), bandeau « nom » et puce de disponibilité
 * flottante. Entièrement décoratif : le sens est porté par le bandeau texte.
 */
function AboutVisual({
  wrapperRef,
  parallaxRef,
}: {
  wrapperRef: React.RefObject<HTMLDivElement>;
  parallaxRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <div ref={wrapperRef} className="relative mx-auto w-full max-w-md">
      {/* Halo orange diffus derrière le cadre */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-6 -z-10"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 42%, rgba(255,107,44,0.28), transparent 70%)",
        }}
      />

      {/* Cadre glassmorphism (ratio portrait) */}
      <div className="glass relative aspect-[4/5] w-full overflow-hidden rounded-[1.75rem] shadow-glow-md">
        {/* Couche parallaxe : plus haute que le cadre pour couvrir le déplacement vertical. */}
        <div ref={parallaxRef} className="absolute inset-x-0 -inset-y-[15%]">
          {/* Photo de Tom, en plein cadre */}
          <Image
            src="/assets/tom.jpg"
            alt="Tom, fondateur de Fluidea"
            fill
            sizes="(max-width: 1023px) 90vw, 28rem"
            className="object-cover object-center"
          />
          {/* Teinte orange douce : accorde le portrait à l'ambiance de la marque. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-primary/20 mix-blend-soft-light"
          />
        </div>

        {/* Voile sombre léger + fondu haut : intègre le portrait au fond du site. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-bg/50 via-bg/5 to-transparent"
        />
        {/* Liseré interne lumineux */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[1.75rem] ring-1 ring-inset ring-white/10"
        />
        {/* Scrim bas pour la lisibilité du bandeau */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-bg/90 via-bg/40 to-transparent"
        />
        {/* Bandeau « nom » */}
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
          <p className="font-display text-lg font-semibold text-text">Tom</p>
          <p className="text-sm text-text-muted">
            Fondateur de Fluidea · Expert automatisation IA
          </p>
        </div>
      </div>

      {/* Puce flottante : disponibilité (appel à l'action discret). Le point
          « pulse » est neutralisé sous prefers-reduced-motion (CSS global). */}
      <div className="glass absolute -bottom-4 -right-3 flex items-center gap-2 rounded-full px-4 py-2 shadow-glow-sm sm:-right-5">
        <span aria-hidden="true" className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
        </span>
        <span className="whitespace-nowrap text-xs font-medium text-text">
          Disponible pour vos projets
        </span>
      </div>
    </div>
  );
}

/**
 * Section « À propos de Fluidea » : présente Tom (expert en automatisation IA
 * qui conçoit et implante des systèmes sur-mesure avec n8n et Claude, et partage
 * son expertise auprès d'une large communauté).
 *
 * Mise en page deux colonnes : à gauche un visuel (cadre glassmorphism + halo
 * orange + léger parallaxe), à droite le texte (accroche, paragraphe sur
 * l'expertise et l'approche, points forts avec icônes, mini-stats) et un CTA.
 *
 * Animations : révélation du visuel et cascade du texte au scroll (GSAP
 * ScrollTrigger), parallaxe subtile du visuel. `gsap.matchMedia` respecte
 * `prefers-reduced-motion` : sans mouvement autorisé, tout est visible et fixe.
 */
export function About() {
  const visualRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const reducedMotion = useReducedMotion();

  // Défilement doux vers la section réservation (CTA), comme dans Hero/Services/Process.
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
    gsap.registerPlugin(ScrollTrigger);

    const mm = gsap.matchMedia();
    // Tout est neutralisé si l'utilisateur préfère réduire les mouvements.
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // 1) Révélation du visuel.
      const visual = visualRef.current;
      if (visual) {
        gsap.from(visual, {
          opacity: 0,
          y: 48,
          scale: 0.96,
          duration: 0.85,
          ease: "power3.out",
          scrollTrigger: { trigger: visual, start: "top 85%", once: true },
        });
      }

      // 2) Révélation en cascade des blocs de texte.
      const text = textRef.current;
      if (text) {
        gsap.from(Array.from(text.children), {
          opacity: 0,
          y: 32,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.1,
          scrollTrigger: { trigger: text, start: "top 80%", once: true },
        });
      }

      // 3) Parallaxe subtile : la couche interne du visuel glisse au scroll.
      const parallax = parallaxRef.current;
      if (parallax && visual) {
        gsap.fromTo(
          parallax,
          { yPercent: -6 },
          {
            yPercent: 6,
            ease: "none",
            scrollTrigger: {
              trigger: visual,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.6,
            },
          }
        );
      }
    });

    return () => mm.revert();
  }, []);

  return (
    <Section id="a-propos" aria-label="À propos de Fluidea">
      <Container>
        <SectionHeading
          eyebrow="À propos"
          eyebrowIcon={<LuUserRound />}
          title="À propos de Fluidea"
          subtitle="L'expertise et l'approche derrière les systèmes qui vont faire tourner votre activité."
        />

        <div className="mt-12 grid grid-cols-1 items-center gap-12 sm:mt-16 lg:grid-cols-2 lg:gap-16">
          {/* Colonne gauche : visuel */}
          <AboutVisual wrapperRef={visualRef} parallaxRef={parallaxRef} />

          {/* Colonne droite : texte */}
          <div ref={textRef} className="flex flex-col gap-7">
            {/* Accroche */}
            <p className="font-display text-xl font-medium leading-snug text-text sm:text-2xl">
              Moi, c&apos;est <span className="text-gradient">Tom</span> — je conçois
              et j&apos;implante des systèmes d&apos;automatisation IA qui travaillent
              à votre place.
            </p>

            {/* Paragraphe : expertise & approche (ton professionnel mais amical) */}
            <p className="text-base leading-relaxed text-text-muted">
              L&apos;IA n&apos;est pas une mode, c&apos;est un changement de fond.
              Dans 5 ans, la question ne sera pas « est-ce que j&apos;utilise
              l&apos;IA ? » mais « jusqu&apos;où je l&apos;ai intégrée ». Ceux qui
              s&apos;y mettent maintenant prendront une avance difficile à
              rattraper.
            </p>

            <p className="text-base leading-relaxed text-text-muted">
              Mon approche est simple : comprendre vraiment votre activité,
              concevoir une solution taillée pour vous, puis rester à vos côtés
              une fois qu&apos;elle tourne. La bonne nouvelle : ce n&apos;est pas
              réservé aux grandes entreprises ni aux développeurs. N&apos;importe
              quel entrepreneur, freelance ou PME peut s&apos;en emparer dès
              aujourd&apos;hui.
            </p>

            <p className="text-base leading-relaxed text-text-muted">
              En parallèle, je partage mon expertise au quotidien auprès
              d&apos;une large communauté de passionné·es d&apos;IA et
              d&apos;automatisation.
            </p>

            {/* Points forts */}
            <ul className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
              {STRENGTHS.map((strength) => (
                <li key={strength.title} className="group flex items-start gap-3.5">
                  <IconChip icon={strength.icon} />
                  <div className="flex flex-col gap-1">
                    <h3 className="font-display text-base font-semibold text-text">
                      {strength.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-text-muted">
                      {strength.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            {/* Mini-stats */}
            <ul className="grid grid-cols-3 gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:gap-4">
              {MINI_STATS.map((stat) => (
                <li
                  key={stat.label}
                  className="flex flex-col gap-1 text-center sm:text-left"
                  aria-label={`${stat.value} ${stat.label}`}
                >
                  <span
                    aria-hidden="true"
                    className="text-gradient font-display text-2xl font-semibold tracking-tight sm:text-3xl"
                  >
                    {stat.value}
                  </span>
                  <span aria-hidden="true" className="text-xs leading-tight text-text-muted">
                    {stat.label}
                  </span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <div className="pt-1">
              <Button
                href="#reservation"
                size="lg"
                leftIcon={<LuMessagesSquare />}
                rightIcon={<LuArrowRight />}
                onClick={(event) => scrollTo(event, "#reservation")}
                className="w-full sm:w-auto"
              >
                Discutons de votre projet
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
