"use client";

import type { IconType } from "react-icons";
import { LuArrowUpRight } from "react-icons/lu";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SOCIALS, type Social } from "@/lib/socials";
import { cn } from "@/lib/utils";

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg";

/** Un réseau, présenté avec un CTA « Rejoindre » et cliquable (nouvel onglet). */
function SocialStat({ social }: { social: Social }) {
  const Icon: IconType = social.icon;

  const ariaLabel = `${social.name} : rejoindre la communauté ${social.label}. Ouvre dans un nouvel onglet.`;

  return (
    <a
      href={social.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      className={cn(
        "group relative flex flex-col items-center gap-2 rounded-2xl p-4 text-center sm:p-5",
        "transition-[transform,background-color] duration-300 hover:-translate-y-0.5 hover:bg-white/[0.03]",
        FOCUS_RING
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "inline-flex h-11 w-11 items-center justify-center rounded-full",
          "bg-primary/10 text-primary shadow-glow-sm ring-1 ring-primary/20",
          "transition-[background-color,box-shadow,transform] duration-300",
          "group-hover:scale-105 group-hover:bg-primary/15 group-hover:shadow-glow-md"
        )}
      >
        <Icon className="h-5 w-5" />
      </span>

      <span className="text-gradient font-display text-2xl font-semibold tracking-tight sm:text-3xl">
        Rejoindre
      </span>

      <span className="inline-flex items-center gap-1 text-xs text-text-muted sm:text-sm">
        {social.label}
        <LuArrowUpRight
          aria-hidden="true"
          className="h-3.5 w-3.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />
      </span>
    </a>
  );
}

/**
 * Bandeau « preuve sociale » placé juste sous le Hero : il invite à rejoindre
 * la communauté Fluidea et renvoie vers chaque réseau social. Sobre et premium.
 */
export function SocialProof() {
  return (
    <Section aria-labelledby="social-proof-heading" className="py-14 sm:py-16 lg:py-20">
      <Container>
        <div className="glass relative overflow-hidden rounded-2xl p-6 shadow-glow-sm sm:p-8 lg:p-10">
          {/* Léger halo orange (décoratif) */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(55% 80% at 12% 0%, rgba(255, 107, 44, 0.12), transparent 72%)",
            }}
          />

          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-12">
            <p
              id="social-proof-heading"
              className="max-w-md text-center font-display text-xl font-semibold leading-snug text-text sm:text-2xl lg:max-w-xs lg:text-left"
            >
              Rejoignez une communauté de{" "}
              <span className="text-gradient">110&nbsp;000 abonnés</span> qui automatise
              son activité
            </p>

            <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 lg:border-l lg:border-white/10 lg:pl-10">
              {SOCIALS.map((social) => (
                <SocialStat key={social.key} social={social} />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
