"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
  type MouseEvent,
} from "react";
import type { IconType } from "react-icons";
import {
  LuArrowRight,
  LuBellPlus,
  LuCalendarCheck,
  LuCheck,
  LuCircleCheck,
  LuFileText,
  LuGraduationCap,
  LuSearchCheck,
  LuSparkles,
  LuWorkflow,
} from "react-icons/lu";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Badge } from "@/components/ui/Badge";
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

interface Plan {
  /** Identifiant court (clé React). */
  key: string;
  /** Icône d'en-tête de l'offre. */
  icon: IconType;
  /** Nom de l'offre. */
  name: string;
  /** Prix ou mention mise en avant (« Offert », « Sur devis », « Bientôt »). */
  price: string;
  /** Précision sous le prix. */
  priceNote?: string;
  /** Promesse de l'offre (orientée valeur). */
  description: string;
  /** Bénéfices inclus, listés avec une icône de validation. */
  features: string[];
  /** Libellé du bouton d'action. */
  cta: string;
  /** Icône du bouton d'action. */
  ctaIcon: IconType;
  /** Carte mise en avant : bordure lumineuse, badge « Populaire », surélevée. */
  featured?: boolean;
  /** Badge affiché près de l'en-tête (ex. « Bientôt »). */
  badge?: string;
  /** Offre à venir : le CTA ouvre une inscription à la liste d'attente. */
  waitlist?: boolean;
}

/**
 * Les 3 offres. Prix et mentions sont des valeurs d'exemple, faciles à ajuster
 * (modifier `price` / `priceNote` suffit). L'audit est positionné en point
 * d'entrée à faible friction ; le système sur-mesure est l'offre phare.
 */
const PLANS: Plan[] = [
  {
    key: "audit",
    icon: LuSearchCheck,
    name: "Audit Automatisation",
    price: "Offert",
    priceNote: "Appel découverte, sans engagement",
    description:
      "Le point de départ idéal. On analyse vos process, on repère les tâches qui vous coûtent le plus de temps et on vous remet un plan d'action clair et priorisé.",
    features: [
      "Analyse complète de vos process actuels",
      "Repérage des automatisations à fort impact",
      "Plan d'action priorisé, prêt à déployer",
      "Estimation du temps et du budget économisés",
    ],
    cta: "Réserver un appel découverte",
    ctaIcon: LuCalendarCheck,
  },
  {
    key: "systeme",
    icon: LuWorkflow,
    name: "Système sur-mesure",
    price: "Sur devis",
    priceNote: "Selon vos besoins et la complexité",
    description:
      "La solution complète. On conçoit, développe et déploie votre système d'automatisation de A à Z avec n8n et Claude — pensé pour vos process et connecté à vos outils.",
    features: [
      "Conception sur-mesure, de A à Z",
      "Développement complet n8n + Claude",
      "Intégration à vos outils existants",
      "Tests, mise en production et documentation",
      "Accompagnement et suivi après livraison",
    ],
    cta: "Demander un devis",
    ctaIcon: LuFileText,
    featured: true,
    badge: "Populaire",
  },
  {
    key: "formation",
    icon: LuGraduationCap,
    name: "Formation",
    price: "Bientôt",
    priceNote: "Inscriptions à venir",
    description:
      "Pour devenir autonome. Une formation pour maîtriser l'IA et l'automatisation, et bâtir vos propres systèmes n8n + Claude en toute confiance.",
    features: [
      "Méthode pas à pas, de zéro à autonome",
      "Cas pratiques et modèles réutilisables",
      "Accès à la communauté et aux mises à jour",
    ],
    cta: "Rejoindre la liste",
    ctaIcon: LuBellPlus,
    badge: "Bientôt",
    waitlist: true,
  },
];

const RESERVATION_ANCHOR = "#reservation";

/** Icône d'offre dans une pastille orange (réagit au survol de la carte). */
function PlanIcon({ icon: Icon, featured }: { icon: IconType; featured?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ring-1",
        "transition-[background-color,box-shadow,transform] duration-300 group-hover:scale-105",
        featured
          ? "bg-primary/20 text-primary shadow-glow-md ring-primary/30"
          : "bg-primary/10 text-primary shadow-glow-sm ring-primary/20 group-hover:bg-primary/15 group-hover:shadow-glow-md"
      )}
    >
      <Icon className="h-6 w-6" />
    </span>
  );
}

/**
 * Inscription à la liste d'attente (offre « Bientôt »). Le CTA « Rejoindre la
 * liste » dévoile un champ e-mail ; à la validation, une confirmation est
 * annoncée aux lecteurs d'écran (`role="status"`). Front-end pour l'instant :
 * le branchement à un outil d'emailing / n8n sera ajouté plus tard.
 */
function JoinWaitlist({ label, icon: Icon }: { label: string; icon: IconType }) {
  const [state, setState] = useState<"idle" | "open" | "joined">("idle");
  const [email, setEmail] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Quand le champ s'ouvre, on y place le focus (continuité clavier).
  useEffect(() => {
    if (state === "open") inputRef.current?.focus();
  }, [state]);

  if (state === "joined") {
    return (
      <div
        role="status"
        className="mt-auto flex items-center gap-2.5 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-text"
      >
        <LuCheck aria-hidden="true" className="h-4 w-4 shrink-0 text-primary" />
        <span>Merci ! On vous prévient dès l&apos;ouverture des inscriptions.</span>
      </div>
    );
  }

  if (state === "idle") {
    return (
      <Button
        type="button"
        variant="secondary"
        className="mt-auto w-full"
        leftIcon={<Icon />}
        onClick={() => setState("open")}
      >
        {label}
      </Button>
    );
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) return;
    setState("joined");
  };

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="Liste d'attente — formation IA &amp; automatisation"
      className="mt-auto flex flex-col gap-2"
    >
      <label htmlFor="pricing-waitlist-email" className="sr-only">
        Votre adresse e-mail
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          ref={inputRef}
          id="pricing-waitlist-email"
          name="email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="vous@exemple.com"
          autoComplete="email"
          inputMode="email"
          className={cn(
            "min-w-0 flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-text",
            "placeholder:text-text-muted/60 transition-[border-color,background-color,box-shadow]",
            "focus:border-primary/50 focus:bg-white/[0.07] focus:outline-none focus:ring-2 focus:ring-primary/30"
          )}
        />
        <Button type="submit" magnetic={false} rightIcon={<LuArrowRight />} className="shrink-0">
          Rejoindre
        </Button>
      </div>
      <p className="text-xs text-text-muted/80">Zéro spam. Désinscription en un clic.</p>
    </form>
  );
}

/** Une carte d'offre (glassmorphism). La carte `featured` est mise en avant. */
function PricingCard({
  plan,
  onCtaClick,
}: {
  plan: Plan;
  onCtaClick: (event: MouseEvent<HTMLAnchorElement>) => void;
}) {
  const { featured } = plan;

  return (
    <article
      aria-label={featured ? `Offre ${plan.name} (la plus populaire)` : `Offre ${plan.name}`}
      className={cn(
        "glass group relative flex h-full flex-col gap-6 rounded-2xl p-6 sm:p-8",
        "transition-[transform,box-shadow,border-color] duration-300 ease-out",
        featured
          ? cn(
              "glow-border bg-primary/[0.06] shadow-glow-lg",
              // Légèrement surélevée dès qu'elle est en ligne (md+), encore plus au survol.
              "hover:-translate-y-1 md:-translate-y-4 md:hover:-translate-y-6"
            )
          : "hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-glow-md"
      )}
    >
      {/* Halo orange : permanent et marqué sur l'offre phare, sinon révélé au survol. */}
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-500",
          featured ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}
        style={{
          background: featured
            ? "radial-gradient(70% 55% at 50% 0%, rgba(255,107,44,0.18), transparent 72%)"
            : "radial-gradient(60% 55% at 50% 0%, rgba(255,107,44,0.13), transparent 72%)",
        }}
      />

      {/* Badge « Populaire » flottant (offre phare) */}
      {featured ? (
        <div className="pointer-events-none absolute -top-3.5 left-1/2 z-10 -translate-x-1/2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-gradient px-3.5 py-1 text-xs font-semibold text-bg shadow-glow-md">
            <LuSparkles aria-hidden="true" className="h-3.5 w-3.5" />
            {plan.badge}
          </span>
        </div>
      ) : null}

      {/* En-tête : icône (+ badge éventuel), nom, prix/mention, promesse */}
      <header className="relative flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <PlanIcon icon={plan.icon} featured={featured} />
          {plan.badge && !featured ? (
            <Badge className="px-3 py-1 text-xs">{plan.badge}</Badge>
          ) : null}
        </div>

        <div>
          <h3 className="font-display text-xl font-semibold text-text">{plan.name}</h3>
          <p
            className={cn(
              "mt-2 font-display text-3xl font-semibold tracking-tight",
              featured ? "text-gradient" : "text-text"
            )}
          >
            {plan.price}
          </p>
          {plan.priceNote ? (
            <p className="mt-1 text-xs text-text-muted">{plan.priceNote}</p>
          ) : null}
        </div>

        <p className="text-sm leading-relaxed text-text-muted">{plan.description}</p>
      </header>

      {/* Bénéfices inclus */}
      <ul className="relative flex flex-col gap-3">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5">
            <LuCircleCheck aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <span className="text-sm leading-relaxed text-text-muted">{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA (poussé en bas pour aligner les cartes) */}
      {plan.waitlist ? (
        <JoinWaitlist label={plan.cta} icon={plan.ctaIcon} />
      ) : (
        <Button
          href={RESERVATION_ANCHOR}
          variant={featured ? "primary" : "secondary"}
          onClick={onCtaClick}
          leftIcon={<plan.ctaIcon />}
          rightIcon={featured ? <LuArrowRight /> : undefined}
          className="relative mt-auto w-full"
        >
          {plan.cta}
        </Button>
      )}
    </article>
  );
}

/**
 * Section « Nos offres » : 3 cartes tarifaires glassmorphism (audit en point
 * d'entrée, système sur-mesure mis en avant, formation à venir). L'offre phare
 * est légèrement surélevée, plus lumineuse, avec une bordure lumineuse et un
 * badge « Populaire ». Les cartes se soulèvent au survol et se révèlent en
 * cascade au scroll (GSAP). `gsap.matchMedia` respecte `prefers-reduced-motion`
 * (sans mouvement autorisé, les cartes restent visibles et fixes).
 */
export function Pricing() {
  const gridRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const reducedMotion = useReducedMotion();

  // Défilement doux vers la section réservation (cible des CTA), comme ailleurs.
  const scrollToReservation = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      if (lenis) {
        lenis.scrollTo(RESERVATION_ANCHOR, { offset: -80 });
      } else {
        document.querySelector(RESERVATION_ANCHOR)?.scrollIntoView({
          behavior: reducedMotion ? "auto" : "smooth",
          block: "start",
        });
      }
    },
    [lenis, reducedMotion]
  );

  useIsomorphicLayoutEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    gsap.registerPlugin(ScrollTrigger);

    const mm = gsap.matchMedia();
    // Neutralisé si l'utilisateur préfère réduire les mouvements.
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // On anime les conteneurs (enfants de la grille) : la carte interne garde
      // ainsi le plein contrôle de ses propres transformations (survol, offre
      // phare surélevée), sans conflit avec le transform posé par GSAP.
      gsap.from(Array.from(grid.children), {
        opacity: 0,
        y: 48,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.14,
        scrollTrigger: { trigger: grid, start: "top 82%", once: true },
      });
    });

    return () => mm.revert();
  }, []);

  return (
    <Section id="tarifs" aria-label="Nos offres">
      <Container>
        <SectionHeading
          eyebrow="Tarifs"
          eyebrowIcon={<LuSparkles />}
          title="Nos offres"
          subtitle="Un point d'entrée accessible, un accompagnement complet ou la montée en autonomie : choisissez l'offre qui correspond à votre projet."
        />

        <div
          ref={gridRef}
          className="mt-14 grid grid-cols-1 gap-6 sm:mt-16 md:grid-cols-3 lg:gap-8"
        >
          {PLANS.map((plan) => (
            // Conteneur = cible de la révélation GSAP (cf. useIsomorphicLayoutEffect).
            <div key={plan.key} className="h-full">
              <PricingCard plan={plan} onCtaClick={scrollToReservation} />
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
