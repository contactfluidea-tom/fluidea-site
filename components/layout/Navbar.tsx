"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import {
  AnimatePresence,
  motion,
  type Transition,
  type Variants,
} from "framer-motion";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useLenis } from "./SmoothScrollProvider";

/** Un lien de navigation : ancre de section (défaut) ou route à part entière (`route`). */
type NavLink = { label: string; href: string; route?: boolean };

const NAV_LINKS: readonly NavLink[] = [
  { label: "Process", href: "#process" },
  { label: "Réalisations", href: "#realisations" },
  { label: "À propos", href: "#a-propos" },
  { label: "Services", href: "#tarifs" },
  { label: "FAQ", href: "/faq", route: true },
];

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg";

/**
 * Barre de navigation principale : transparente au-dessus du hero, puis
 * glassmorphism sombre + bordure lumineuse au scroll. Liens d'ancrage avec
 * surlignage de la section active, CTA « Prendre rendez-vous », et menu
 * plein écran sur mobile (hamburger animé, piège de focus, Échap, verrou du
 * scroll). Respecte `prefers-reduced-motion`.
 */
export function Navbar() {
  const reducedMotion = useReducedMotion();
  const lenis = useLenis();
  const pathname = usePathname();
  const isHome = pathname === "/";
  // Hors accueil, les ancres pointent vers la home (`/#ancre`) ; sur l'accueil,
  // elles déclenchent le smooth scroll local.
  const sectionHref = (href: string) => (isHome ? href : `/${href}`);

  const [scrolled, setScrolled] = useState(false);
  const [activeId, setActiveId] = useState("");
  const [open, setOpen] = useState(false);

  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Bascule en fond glass après quelques pixels de scroll.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Surligne le lien dont la section croise le centre de l'écran.
  useEffect(() => {
    const sections = NAV_LINKS.filter((link) => !link.route)
      .map(({ href }) => document.getElementById(href.slice(1)))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        }
      },
      { rootMargin: "-50% 0px -50% 0px" }
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  // Verrou du scroll (body + Lenis) tant que le menu mobile est ouvert.
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    lenis?.stop();
    return () => {
      document.body.style.overflow = previousOverflow;
      lenis?.start();
    };
  }, [open, lenis]);

  // Échap pour fermer + piège de focus (bouton hamburger inclus).
  useEffect(() => {
    if (!open) return;

    // Capturé au montage : le bouton est stable, on lui rend le focus à la fermeture.
    const toggle = toggleRef.current;

    const getFocusable = () => {
      const panelEls = panelRef.current
        ? Array.from(
            panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
          )
        : [];
      return [toggleRef.current, ...panelEls].filter(
        (el): el is HTMLElement => el !== null && el.offsetParent !== null
      );
    };

    // Donne le focus au premier lien du panneau à l'ouverture.
    panelRef.current?.querySelector<HTMLElement>("a[href]")?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = getFocusable();
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      toggle?.focus(); // rend le focus au bouton déclencheur
    };
  }, [open]);

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

  const handleNavClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>, href: string) => {
      setOpen(false);
      // Hors accueil, on laisse le lien `/#ancre` naviguer normalement.
      if (!isHome) return;
      event.preventDefault();
      scrollTo(href);
    },
    [isHome, scrollTo]
  );

  const handleLogoClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      setOpen(false);
      // Hors accueil, le lien "/" ramène à la home.
      if (!isHome) return;
      event.preventDefault();
      scrollTo(0);
    },
    [isHome, scrollTo]
  );

  const transition: Transition = reducedMotion
    ? { duration: 0 }
    : { duration: 0.3, ease: [0.22, 1, 0.36, 1] };

  const listVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reducedMotion ? 0 : 0.07,
        delayChildren: reducedMotion ? 0 : 0.12,
      },
    },
  };

  const itemVariants: Variants = reducedMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
        },
      };

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 border-b duration-300",
          "transition-[background-color,border-color,box-shadow,backdrop-filter]",
          scrolled && !open
            ? "border-primary/25 bg-surface/70 shadow-glow-sm backdrop-blur-lg backdrop-saturate-150"
            : "border-transparent bg-transparent"
        )}
      >
        <nav
          aria-label="Navigation principale"
          className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 sm:h-20 sm:px-8 lg:px-12"
        >
          {/* Logo */}
          <a
            href={isHome ? "#hero" : "/"}
            onClick={handleLogoClick}
            aria-label="Fluidea — accueil"
            className={cn("group flex shrink-0 items-center gap-2.5 rounded-xl", FOCUS_RING)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- logo SVG statique, servi tel quel (pas d'optimisation nécessaire) */}
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

          {/* Liens — desktop */}
          <ul className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => {
              const isActive = link.route
                ? pathname === link.href
                : activeId === link.href.slice(1);
              const linkClass = cn(
                "relative rounded-full px-4 py-2 text-sm font-medium transition-colors",
                FOCUS_RING,
                isActive ? "text-text" : "text-text-muted hover:text-text"
              );
              const inner = (
                <>
                  {isActive &&
                    (reducedMotion ? (
                      <span className="absolute inset-0 rounded-full bg-white/[0.07] ring-1 ring-white/10" />
                    ) : (
                      <motion.span
                        layoutId="navbar-active"
                        className="absolute inset-0 rounded-full bg-white/[0.07] ring-1 ring-white/10"
                        transition={{ type: "spring", stiffness: 400, damping: 32 }}
                      />
                    ))}
                  <span className="relative">{link.label}</span>
                </>
              );
              return (
                <li key={link.href}>
                  {link.route ? (
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      aria-current={isActive ? "page" : undefined}
                      className={linkClass}
                    >
                      {inner}
                    </Link>
                  ) : (
                    <a
                      href={sectionHref(link.href)}
                      onClick={(event) => handleNavClick(event, link.href)}
                      aria-current={isActive ? "true" : undefined}
                      className={linkClass}
                    >
                      {inner}
                    </a>
                  )}
                </li>
              );
            })}
          </ul>

          {/* CTA + hamburger */}
          <div className="flex items-center gap-2">
            <Button
              href={sectionHref("#reservation")}
              size="sm"
              onClick={(event: MouseEvent<HTMLAnchorElement>) =>
                handleNavClick(event, "#reservation")
              }
              className="hidden lg:inline-flex"
            >
              Prendre rendez-vous
            </Button>

            <button
              ref={toggleRef}
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
              className={cn(
                "relative grid h-10 w-10 place-items-center rounded-full text-text",
                "transition-colors hover:bg-white/5 lg:hidden",
                FOCUS_RING
              )}
            >
              <span className="relative block h-3.5 w-6" aria-hidden="true">
                <motion.span
                  className="absolute left-0 top-0 block h-0.5 w-6 rounded-full bg-current"
                  animate={open ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                  transition={transition}
                />
                <motion.span
                  className="absolute left-0 top-1.5 block h-0.5 w-6 rounded-full bg-current"
                  animate={open ? { opacity: 0, scaleX: 0.4 } : { opacity: 1, scaleX: 1 }}
                  transition={transition}
                />
                <motion.span
                  className="absolute bottom-0 left-0 block h-0.5 w-6 rounded-full bg-current"
                  animate={open ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                  transition={transition}
                />
              </span>
            </button>
          </div>
        </nav>
      </header>

      {/* Panneau plein écran — mobile */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-menu"
            id="mobile-menu"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menu de navigation"
            className="glass fixed inset-0 z-40 flex flex-col lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={transition}
          >
            <motion.ul
              variants={listVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-1 flex-col justify-center gap-1 px-6 pb-12 pt-24"
            >
              {NAV_LINKS.map((link) => {
                const isActive = link.route
                  ? pathname === link.href
                  : activeId === link.href.slice(1);
                const linkClass = cn(
                  "block rounded-2xl py-2 font-display text-3xl font-semibold transition-colors sm:text-4xl",
                  FOCUS_RING,
                  isActive ? "text-gradient" : "text-text-muted hover:text-text"
                );
                return (
                  <motion.li key={link.href} variants={itemVariants}>
                    {link.route ? (
                      <Link
                        href={link.href}
                        onClick={() => setOpen(false)}
                        aria-current={isActive ? "page" : undefined}
                        className={linkClass}
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={sectionHref(link.href)}
                        onClick={(event) => handleNavClick(event, link.href)}
                        aria-current={isActive ? "true" : undefined}
                        className={linkClass}
                      >
                        {link.label}
                      </a>
                    )}
                  </motion.li>
                );
              })}

              <motion.li variants={itemVariants} className="mt-8">
                <Button
                  href={sectionHref("#reservation")}
                  size="lg"
                  magnetic={false}
                  onClick={(event: MouseEvent<HTMLAnchorElement>) =>
                    handleNavClick(event, "#reservation")
                  }
                  className="w-full"
                >
                  Prendre rendez-vous
                </Button>
              </motion.li>
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
