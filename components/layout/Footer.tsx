"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, type MouseEvent } from "react";
import { LuArrowUp, LuArrowUpRight, LuCalendarCheck, LuMail } from "react-icons/lu";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useLenis } from "@/components/layout/SmoothScrollProvider";
import { SOCIALS } from "@/lib/socials";

const CONTACT_EMAIL = "contact.fluidea@gmail.com";

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg";

/** Un lien de pied de page : ancre de section (défaut) ou route à part entière (`route`). */
type FooterLink = { label: string; href: string; route?: boolean };

/** Liens du pied de page (reprend la Navbar + Contact). */
const FOOTER_NAV: readonly FooterLink[] = [
  { label: "Process", href: "#process" },
  { label: "Réalisations", href: "#realisations" },
  { label: "À propos", href: "#a-propos" },
  { label: "Services", href: "#tarifs" },
  { label: "FAQ", href: "/faq", route: true },
  { label: "Contact", href: "#contact" },
];

/** Pages légales. */
const LEGAL_LINKS = [
  { label: "Mentions légales", href: "/mentions-legales" },
  { label: "Politique de confidentialité", href: "/politique-de-confidentialite" },
  { label: "CGV", href: "/cgv" },
] as const;

// Réseaux dans l'ordre demandé (Instagram en tête), sans toucher à la source partagée.
const SOCIAL_ORDER = ["instagram", "facebook", "tiktok", "linkedin"];
const FOOTER_SOCIALS = [...SOCIALS].sort(
  (a, b) => SOCIAL_ORDER.indexOf(a.key) - SOCIAL_ORDER.indexOf(b.key)
);

/** Petit titre de colonne du pied de page. */
function ColumnTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-widest text-text-muted">
      {children}
    </h2>
  );
}

/**
 * Pied de page du site : fond sombre, fine bordure supérieure lumineuse et léger
 * halo orange. Colonnes responsives (marque + accroche + réseaux, navigation,
 * bloc « Réserver ») puis une barre inférieure (copyright, liens légaux, bouton
 * « Retour en haut »). Smooth scroll via Lenis, animations de survol lumineuses,
 * `prefers-reduced-motion` respecté.
 */
export function Footer() {
  const reducedMotion = useReducedMotion();
  const lenis = useLenis();
  const pathname = usePathname();
  const isHome = pathname === "/";
  // Hors accueil, les ancres pointent vers la home (`/#ancre`).
  const sectionHref = (href: string) => (isHome ? href : `/${href}`);

  const scrollTo = useCallback(
    (target: string | number) => {
      if (lenis) {
        lenis.scrollTo(target, { offset: typeof target === "number" ? 0 : -80 });
      } else if (typeof target === "number") {
        window.scrollTo({ top: target, behavior: reducedMotion ? "auto" : "smooth" });
      } else {
        document.querySelector(target)?.scrollIntoView({
          behavior: reducedMotion ? "auto" : "smooth",
          block: "start",
        });
      }
    },
    [lenis, reducedMotion]
  );

  const handleAnchor = useCallback(
    (event: MouseEvent<HTMLAnchorElement>, target: string) => {
      // Hors accueil, on laisse le lien `/#ancre` naviguer normalement.
      if (!isHome) return;
      event.preventDefault();
      scrollTo(target);
    },
    [isHome, scrollTo]
  );

  return (
    <footer className="relative overflow-hidden border-t border-white/5 bg-bg/50">
      {/* Fine bordure supérieure lumineuse */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent"
      />
      {/* Léger halo orange sous la bordure */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-40 w-[40rem] max-w-full -translate-x-1/2"
        style={{
          background:
            "radial-gradient(50% 100% at 50% 0%, rgba(255,107,44,0.12), transparent 70%)",
        }}
      />

      <Container>
        <div className="relative grid grid-cols-1 gap-10 py-14 sm:grid-cols-2 sm:py-16 lg:grid-cols-4">
          {/* Marque + accroche + réseaux */}
          <div className="sm:col-span-2">
            <a
              href={isHome ? "#hero" : "/"}
              onClick={(event) => handleAnchor(event, "#hero")}
              aria-label="Fluidea — accueil"
              className={cn("group inline-flex items-center gap-2.5 rounded-xl", FOCUS_RING)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- logo SVG statique servi tel quel */}
              <img
                src="/assets/logo-fluidea-mark.svg"
                alt=""
                width={32}
                height={39}
                className="h-9 w-auto transition-transform duration-300 group-hover:scale-105"
              />
              <span className="font-display text-lg font-semibold tracking-tight text-text">
                Fluidea
              </span>
            </a>

            {/* Slogan de marque */}
            <p className="mt-3 text-sm font-medium text-text">
              Fluidifier votre façon de travailler.
            </p>

            <p className="mt-4 max-w-xs text-sm leading-relaxed text-text-muted">
              Fluidea conçoit des automatisations IA qui transforment votre temps en
              résultats — votre activité tourne bien, imaginez ce que l&apos;IA peut en
              faire.
            </p>

            <ul className="mt-6 flex flex-wrap gap-3">
              {FOOTER_SOCIALS.map((social) => {
                const Icon = social.icon;
                return (
                  <li key={social.key}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${social.name} (ouvre dans un nouvel onglet)`}
                      className={cn(
                        "glass grid h-10 w-10 place-items-center rounded-full text-text-muted",
                        "transition-[color,border-color,box-shadow,transform] duration-300",
                        "hover:-translate-y-0.5 hover:border-primary/50 hover:text-primary hover:shadow-glow-sm",
                        FOCUS_RING
                      )}
                    >
                      <Icon aria-hidden="true" className="h-4 w-4" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Navigation */}
          <nav aria-label="Liens de pied de page">
            <ColumnTitle>Navigation</ColumnTitle>
            <ul className="mt-4 flex flex-col gap-3">
              {FOOTER_NAV.map((link) => {
                const linkClass = cn(
                  "group inline-flex items-center gap-1.5 rounded text-sm text-text-muted",
                  "transition-colors hover:text-text",
                  FOCUS_RING
                );
                const arrow = (
                  <LuArrowUpRight
                    aria-hidden="true"
                    className="h-3.5 w-3.5 -translate-x-1 text-primary opacity-0 transition duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                  />
                );
                return (
                  <li key={link.href}>
                    {link.route ? (
                      <Link href={link.href} className={linkClass}>
                        {link.label}
                        {arrow}
                      </Link>
                    ) : (
                      <a
                        href={sectionHref(link.href)}
                        onClick={(event) => handleAnchor(event, link.href)}
                        className={linkClass}
                      >
                        {link.label}
                        {arrow}
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Réserver */}
          <div>
            <ColumnTitle>Réserver</ColumnTitle>
            <p className="mt-4 text-sm leading-relaxed text-text-muted">
              Prêt·e à automatiser ? Réservez un appel découverte gratuit de 30 minutes.
            </p>
            <Button
              href={sectionHref("#reservation")}
              onClick={(event: MouseEvent<HTMLAnchorElement>) =>
                handleAnchor(event, "#reservation")
              }
              leftIcon={<LuCalendarCheck />}
              className="mt-4 w-full"
            >
              Réserver un appel
            </Button>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className={cn(
                "mt-4 inline-flex items-center gap-2 rounded text-sm text-text-muted",
                "transition-colors hover:text-primary",
                FOCUS_RING
              )}
            >
              <LuMail aria-hidden="true" className="h-4 w-4 shrink-0" />
              <span className="break-all">{CONTACT_EMAIL}</span>
            </a>
          </div>
        </div>

        {/* Barre inférieure */}
        <div className="relative flex flex-col items-center gap-4 border-t border-white/10 py-7 sm:flex-row sm:justify-between">
          <p className="order-3 text-sm text-text-muted sm:order-1">
            © 2026 Fluidea — Tous droits réservés
          </p>

          <nav
            aria-label="Liens légaux"
            className="order-1 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 sm:order-2"
          >
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded text-sm text-text-muted transition-colors hover:text-text",
                  FOCUS_RING
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => scrollTo(0)}
            className={cn(
              "glass group order-2 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-text",
              "transition-[color,border-color,box-shadow,transform] duration-300",
              "hover:-translate-y-0.5 hover:border-primary/50 hover:text-primary hover:shadow-glow-sm",
              "sm:order-3",
              FOCUS_RING
            )}
          >
            Retour en haut
            <LuArrowUp
              aria-hidden="true"
              className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5"
            />
          </button>
        </div>
      </Container>
    </footer>
  );
}
