"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import type { IconType } from "react-icons";
import {
  LuTrendingUp,
  LuTriangleAlert,
  LuTrophy,
  LuWandSparkles,
} from "react-icons/lu";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StackedCards } from "@/components/ui/StackedCards";
import { WorkflowDiagram } from "@/components/ui/WorkflowDiagram";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { WORK_CASES, WORK_STATS, type WorkCase, type WorkStat } from "@/lib/work";

const nf = new Intl.NumberFormat("fr-FR");

// useLayoutEffect côté client, useEffect au rendu serveur (évite l'avertissement
// SSR de React) : on prépare l'animation GSAP avant la première peinture.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Compte de 0 jusqu'à `target` une fois la section visible (`active`). Renvoie
 * directement `target`, sans animer, si reduced-motion est actif.
 */
function useCountUp(target: number, active: boolean, reducedMotion: boolean) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (reducedMotion) {
      setValue(target);
      return;
    }
    if (!active) return;

    const duration = 1800;
    const startTime = performance.now();
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    let raf = requestAnimationFrame(function tick(now) {
      const progress = Math.min(1, (now - startTime) / duration);
      setValue(Math.round(easeOutCubic(progress) * target));
      if (progress < 1) raf = requestAnimationFrame(tick);
    });

    return () => cancelAnimationFrame(raf);
  }, [target, active, reducedMotion]);

  return value;
}

/** Pastille d'icône orange (cohérente avec Services / Process). */
function IconChip({ icon: Icon }: { icon: IconType }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
        "bg-primary/10 text-primary shadow-glow-sm ring-1 ring-primary/20"
      )}
    >
      <Icon className="h-5 w-5" />
    </span>
  );
}

/** Une étape « Problème » ou « Solution » du cas. */
function StepBlock({
  label,
  icon: Icon,
  text,
}: {
  label: string;
  icon: IconType;
  text: string;
}) {
  return (
    <li className="relative flex gap-4">
      <span
        aria-hidden="true"
        className="relative z-10 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary shadow-glow-sm ring-1 ring-primary/20"
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="pt-1">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary/80">
          {label}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-text-muted">{text}</p>
      </div>
    </li>
  );
}

/** Étape « Résultat » : la métrique chiffrée, mise en avant en dégradé. */
function ResultBlock({ result }: { result: string }) {
  return (
    <li className="relative flex gap-4">
      <span
        aria-hidden="true"
        className="relative z-10 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-bg shadow-glow-md"
      >
        <LuTrendingUp className="h-4 w-4" />
      </span>
      <div className="pt-0.5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary/80">
          Résultat
        </p>
        <p className="mt-1 font-display text-xl font-semibold leading-tight sm:text-2xl">
          <span className="text-gradient">{result}</span>
        </p>
      </div>
    </li>
  );
}

/**
 * Une carte de réalisation : à gauche le diagramme de workflow (généré à partir
 * des étapes du cas), à droite le déroulé Problème → Solution → Résultat.
 */
function WorkSlide({ work }: { work: WorkCase }) {
  return (
    <article className="glass relative h-full overflow-hidden rounded-2xl p-6 shadow-glow-sm sm:p-8 lg:p-10">
      {/* Halo orange décoratif */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 90% at 85% 0%, rgba(255, 107, 44, 0.12), transparent 70%)",
        }}
      />

      <div className="relative grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Visuel : diagramme de workflow stylisé */}
        <div>
          <Badge className="px-3 py-1 text-xs">{work.category}</Badge>
          <div className="mt-4 rounded-2xl border border-white/10 bg-bg/40 p-4 sm:p-5">
            <WorkflowDiagram
              nodes={work.nodes}
              ariaLabel={`Automatisation « ${work.title} » : ${work.nodes.join(" puis ")}`}
            />
          </div>
        </div>

        {/* Contenu : Problème → Solution → Résultat */}
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <IconChip icon={work.icon} />
            <h3 className="font-display text-xl font-semibold text-text sm:text-2xl">
              {work.title}
            </h3>
          </div>

          <ol className="relative flex flex-col gap-5">
            {/* Fil reliant les trois temps */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute bottom-5 left-[1.125rem] top-5 w-px -translate-x-1/2 bg-gradient-to-b from-primary/40 via-primary/25 to-primary/40"
            />
            <StepBlock label="Problème" icon={LuTriangleAlert} text={work.problem} />
            <StepBlock label="Solution" icon={LuWandSparkles} text={work.solution} />
            <ResultBlock result={work.result} />
          </ol>
        </div>
      </div>
    </article>
  );
}

/** Un compteur d'impact animé. La valeur finale est lue par les lecteurs d'écran. */
function StatCounter({
  stat,
  active,
  reducedMotion,
}: {
  stat: WorkStat;
  active: boolean;
  reducedMotion: boolean;
}) {
  const Icon = stat.icon;
  const count = useCountUp(stat.value, active, reducedMotion);
  const finalLabel = `${stat.prefix ?? ""}${nf.format(stat.value)}${stat.suffix ?? ""} ${stat.label}`;

  return (
    <div
      className="flex items-center gap-4 p-6 sm:flex-col sm:gap-3 sm:p-8 sm:text-center"
      aria-label={finalLabel}
    >
      <span
        aria-hidden="true"
        className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary shadow-glow-sm ring-1 ring-primary/20"
      >
        <Icon className="h-6 w-6" />
      </span>
      <span className="flex flex-col">
        <span
          aria-hidden="true"
          className="text-gradient font-display text-3xl font-semibold tracking-tight sm:text-4xl"
        >
          {stat.prefix ?? ""}
          {nf.format(count)}
          {stat.suffix ?? ""}
        </span>
        <span aria-hidden="true" className="mt-0.5 text-sm text-text-muted">
          {stat.label}
        </span>
      </span>
    </div>
  );
}

/**
 * Section « Réalisations & cas d'usage » : les cas d'automatisation (diagramme
 * de workflow + déroulé Problème → Solution → Résultat) sont présentés via un
 * effet « stacked cards on scroll » (zone épinglée, cartes qui se superposent
 * en pile au scroll — voir {@link StackedCards}), suivi d'une bande de
 * compteurs d'impact qui s'incrémentent au scroll.
 *
 * `prefers-reduced-motion` : `StackedCards` retombe sur une pile verticale
 * statique, et `useCountUp` affiche directement les chiffres.
 */
export function Work() {
  const statsRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const statsInView = useInView(statsRef, { once: true, margin: "0px 0px -15% 0px" });
  const statsActive = statsInView || reducedMotion;

  useIsomorphicLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const stats = statsRef.current;
      if (stats) {
        gsap.from(stats, {
          opacity: 0,
          y: 36,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: { trigger: stats, start: "top 88%", once: true },
        });
      }
    });

    return () => mm.revert();
  }, []);

  return (
    <Section id="realisations" aria-label="Réalisations et cas d'usage">
      <Container>
        <SectionHeading
          eyebrow="Réalisations"
          eyebrowIcon={<LuTrophy />}
          title="Réalisations & cas d'usage"
          subtitle="Des exemples concrets de systèmes que l'on conçoit — et l'impact qu'ils génèrent au quotidien. Vos projets viendront bientôt enrichir cette sélection."
        />

        <StackedCards className="mt-12 sm:mt-16" ariaLabel="Réalisations & cas d'usage">
          {WORK_CASES.map((work) => (
            <WorkSlide key={work.key} work={work} />
          ))}
        </StackedCards>

        {/* Bande de compteurs d'impact */}
        <h3 className="mt-16 text-center text-sm font-medium uppercase tracking-[0.18em] text-text-muted sm:mt-20">
          L&apos;impact, en chiffres
        </h3>
        <div
          ref={statsRef}
          className="glass relative mt-6 grid grid-cols-1 divide-y divide-white/10 overflow-hidden rounded-2xl shadow-glow-sm sm:grid-cols-3 sm:divide-x sm:divide-y-0"
        >
          {/* Halo orange décoratif */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(60% 100% at 50% 0%, rgba(255, 107, 44, 0.12), transparent 70%)",
            }}
          />
          {WORK_STATS.map((stat) => (
            <StatCounter
              key={stat.key}
              stat={stat}
              active={statsActive}
              reducedMotion={reducedMotion}
            />
          ))}
        </div>
      </Container>
    </Section>
  );
}
