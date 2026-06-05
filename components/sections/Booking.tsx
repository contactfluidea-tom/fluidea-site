"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import type { IconType } from "react-icons";
import {
  LuCalendarCheck,
  LuCircleCheck,
  LuClock,
  LuGift,
  LuShieldCheck,
} from "react-icons/lu";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CalendlyEmbed } from "@/components/ui/CalendlyEmbed";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";

// useLayoutEffect côté client, useEffect au rendu serveur (évite l'avertissement
// SSR de React) : on prépare l'animation GSAP avant la première peinture.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** Ce que l'on retire concrètement de l'appel (orienté valeur). */
const BENEFITS: string[] = [
  "Un échange de 30 min en visio, simple et sans pression",
  "On cible ensemble vos tâches les plus chronophages",
  "Vous repartez avec un plan d'action clair et priorisé",
  "Zéro jargon, zéro blabla commercial : que du concret",
];

interface Reassurance {
  icon: IconType;
  label: string;
}

/** Signaux de réassurance affichés en pastilles. */
const REASSURANCE: Reassurance[] = [
  { icon: LuClock, label: "30 minutes" },
  { icon: LuGift, label: "100 % gratuit" },
  { icon: LuShieldCheck, label: "Sans engagement" },
];

/**
 * Section « Réservation » (cible de tous les CTA du site) : à gauche un texte
 * incitatif (promesse, bénéfices, réassurance, ton amical), à droite le widget
 * Calendly inline dans un cadre glassmorphism nimbé d'orange.
 *
 * Animations : révélation du cadre et cascade du texte au scroll (GSAP
 * ScrollTrigger). `gsap.matchMedia` respecte `prefers-reduced-motion` : sans
 * mouvement autorisé, tout reste visible et fixe.
 */
export function Booking() {
  const visualRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const visual = visualRef.current;
      if (visual) {
        gsap.from(visual, {
          opacity: 0,
          y: 48,
          scale: 0.97,
          duration: 0.85,
          ease: "power3.out",
          scrollTrigger: { trigger: visual, start: "top 85%", once: true },
        });
      }

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
    });

    return () => mm.revert();
  }, []);

  return (
    <Section id="reservation" aria-label="Réserver un appel découverte">
      <Container>
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Colonne gauche : incitation */}
          <div className="flex flex-col gap-8">
            <SectionHeading
              align="left"
              eyebrow="Réservation"
              eyebrowIcon={<LuCalendarCheck />}
              title="Réservez votre appel découverte gratuit"
              subtitle="30 minutes pour faire le point sur votre activité et repartir avec des pistes concrètes — que l'on travaille ensemble ou non."
            />

            <div ref={textRef} className="flex flex-col gap-7">
              {/* Bénéfices */}
              <ul className="flex flex-col gap-3.5">
                {BENEFITS.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <LuCircleCheck
                      aria-hidden="true"
                      className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                    />
                    <span className="text-sm leading-relaxed text-text-muted sm:text-base">
                      {benefit}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Réassurance */}
              <ul className="flex flex-wrap gap-3">
                {REASSURANCE.map(({ icon: Icon, label }) => (
                  <li
                    key={label}
                    className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm text-text"
                  >
                    <Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-primary" />
                    {label}
                  </li>
                ))}
              </ul>

              {/* Touche personnelle (ton amical) */}
              <p className="text-sm leading-relaxed text-text-muted">
                <span className="font-medium text-text">
                  C&apos;est Tom qui vous répond
                </span>{" "}
                — on prend le temps de comprendre votre activité avant de parler
                solutions. Pas de pression, pas de bot.
              </p>
            </div>
          </div>

          {/* Colonne droite : widget Calendly dans un cadre glassmorphism */}
          <div ref={visualRef} className="relative">
            {/* Halo orange diffus derrière le cadre */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-4 -z-10"
              style={{
                background:
                  "radial-gradient(60% 60% at 50% 28%, rgba(255,107,44,0.22), transparent 70%)",
              }}
            />
            <div className="glass relative overflow-hidden rounded-[1.75rem] p-2 shadow-glow-md sm:p-3">
              <CalendlyEmbed minHeight={720} />
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
