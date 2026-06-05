"use client";

import { useCallback, useId, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import {
  LuArrowRight,
  LuCalendarCheck,
  LuMessageCircleQuestion,
  LuPlus,
} from "react-icons/lu";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useLenis } from "@/components/layout/SmoothScrollProvider";
import { FAQ_ITEMS } from "@/lib/faq";

const RESERVATION_ANCHOR = "#reservation";

// Anneau de focus en retrait (le bouton occupe toute la largeur de la carte).
const FOCUS_RING_INSET =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary";

// Courbe d'accélération douce, partagée par les animations de la section.
const EASE = [0.22, 1, 0.36, 1] as const;

// Révélation en cascade des questions au scroll (neutralisée si reduced-motion).
const listVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};
const rowVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

/**
 * Une question de l'accordéon : en-tête `<button>` (avec `aria-expanded` /
 * `aria-controls`) et panneau dont la hauteur s'anime via Framer Motion. La
 * carte glassmorphism se pare d'une fine bordure lumineuse quand elle est
 * ouverte. L'icône « + » pivote en « × ».
 */
function FaqRow({
  question,
  answer,
  index,
  isOpen,
  headerId,
  panelId,
  reducedMotion,
  onToggle,
  onKeyNav,
  registerButton,
}: {
  question: string;
  answer: string;
  index: number;
  isOpen: boolean;
  headerId: string;
  panelId: string;
  reducedMotion: boolean;
  onToggle: () => void;
  onKeyNav: (event: KeyboardEvent<HTMLButtonElement>, index: number) => void;
  registerButton: (el: HTMLButtonElement | null) => void;
}) {
  return (
    <div
      className={cn(
        "glass group overflow-hidden rounded-2xl transition-[border-color,box-shadow] duration-300",
        isOpen ? "border-primary/50 shadow-glow-sm" : "hover:border-white/20"
      )}
    >
      <h3 className="m-0">
        <button
          ref={registerButton}
          type="button"
          id={headerId}
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onToggle}
          onKeyDown={(event) => onKeyNav(event, index)}
          className={cn(
            "flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6 sm:py-5",
            FOCUS_RING_INSET
          )}
        >
          <span className="font-display text-base font-medium text-text sm:text-lg">
            {question}
          </span>
          <span
            aria-hidden="true"
            className={cn(
              "grid h-8 w-8 shrink-0 place-items-center rounded-full border",
              "transition-[transform,background-color,border-color,color] duration-300",
              isOpen
                ? "rotate-45 border-primary/50 bg-primary/15 text-primary"
                : "border-white/10 text-text-muted group-hover:border-white/20 group-hover:text-text"
            )}
          >
            <LuPlus className="h-4 w-4" />
          </span>
        </button>
      </h3>

      {/* Panneau : conteneur permanent (aria-controls toujours valide) +
          contenu monté/démonté et animé en hauteur par Framer Motion. */}
      <div id={panelId} aria-labelledby={headerId}>
        <AnimatePresence initial={false}>
          {isOpen ? (
            <motion.div
              key="content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={
                reducedMotion ? { duration: 0 } : { duration: 0.32, ease: EASE }
              }
              style={{ overflow: "hidden" }}
            >
              <p className="px-5 pb-5 text-sm leading-relaxed text-text-muted sm:px-6 sm:pb-6 sm:text-base">
                {answer}
              </p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}

/**
 * Section « Questions fréquentes » : accordéon accessible (un seul panneau
 * ouvert à la fois), hauteur animée via Framer Motion, icône « + » qui pivote.
 * Clavier complet (Entrée/Espace pour ouvrir, ↑/↓ pour naviguer, Origine/Fin),
 * `aria-expanded` + `aria-controls`. En bas, un encart « Une autre question ? »
 * renvoie vers la prise de contact. `prefers-reduced-motion` est respecté
 * (animations instantanées, pas de révélation au scroll).
 *
 * `headingAs` permet d'élever le titre en `h1` quand la section est utilisée
 * comme contenu principal d'une page dédiée (`/faq`) — `h2` par défaut sur
 * l'accueil. L'encart de CTA est « cross-page » : sur l'accueil il défile en
 * douceur vers la réservation, ailleurs il navigue vers `/#reservation`.
 */
export function Faq({ headingAs = "h2" }: { headingAs?: "h1" | "h2" }) {
  const reducedMotion = useReducedMotion();
  const lenis = useLenis();
  const uid = useId();
  const pathname = usePathname();
  const isHome = pathname === "/";

  // Sur l'accueil, ancre locale ; ailleurs, lien vers la réservation de la home.
  const reservationHref = isHome ? RESERVATION_ANCHOR : `/${RESERVATION_ANCHOR}`;

  // Un seul panneau ouvert à la fois (ou aucun).
  const [openId, setOpenId] = useState<string | null>(null);
  // Références des en-têtes pour la navigation au clavier (↑ / ↓ / Origine / Fin).
  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const scrollToReservation = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      // Hors accueil, on laisse le lien `/#reservation` naviguer normalement.
      if (!isHome) return;
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
    [isHome, lenis, reducedMotion]
  );

  const handleKeyNav = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
      const count = FAQ_ITEMS.length;
      let target: number | null = null;
      switch (event.key) {
        case "ArrowDown":
          target = (index + 1) % count;
          break;
        case "ArrowUp":
          target = (index - 1 + count) % count;
          break;
        case "Home":
          target = 0;
          break;
        case "End":
          target = count - 1;
          break;
        default:
          return;
      }
      event.preventDefault();
      buttonsRef.current[target]?.focus();
    },
    []
  );

  const animate = !reducedMotion;

  return (
    <Section id="faq" aria-label="Questions fréquentes">
      <Container>
        <SectionHeading
          as={headingAs}
          eyebrow="FAQ"
          eyebrowIcon={<LuMessageCircleQuestion />}
          title="Questions fréquentes"
          subtitle="Tout ce qu'il faut savoir avant de se lancer. Une interrogation qui n'est pas couverte ? Posez-la-nous directement."
        />

        {/* Liste des questions */}
        <motion.ul
          variants={animate ? listVariants : undefined}
          initial={animate ? "hidden" : false}
          whileInView={animate ? "visible" : undefined}
          viewport={{ once: true, margin: "0px 0px -10% 0px" }}
          className="mx-auto mt-12 flex max-w-3xl list-none flex-col gap-3 p-0 sm:mt-16"
        >
          {FAQ_ITEMS.map((item, index) => (
            <motion.li key={item.id} variants={animate ? rowVariants : undefined}>
              <FaqRow
                question={item.question}
                answer={item.answer}
                index={index}
                isOpen={openId === item.id}
                headerId={`${uid}-h-${item.id}`}
                panelId={`${uid}-p-${item.id}`}
                reducedMotion={reducedMotion}
                onToggle={() => setOpenId((current) => (current === item.id ? null : item.id))}
                onKeyNav={handleKeyNav}
                registerButton={(el) => {
                  buttonsRef.current[index] = el;
                }}
              />
            </motion.li>
          ))}
        </motion.ul>

        {/* Encart « Une autre question ? » */}
        <motion.div
          initial={animate ? { opacity: 0, y: 20 } : false}
          whileInView={animate ? { opacity: 1, y: 0 } : undefined}
          viewport={{ once: true, margin: "0px 0px -10% 0px" }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mx-auto mt-10 max-w-3xl"
        >
          <div className="glass relative overflow-hidden rounded-2xl p-6 text-center shadow-glow-sm sm:p-8">
            {/* Halo orange diffus (décoratif) */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(55% 80% at 50% 0%, rgba(255,107,44,0.14), transparent 72%)",
              }}
            />
            <div className="relative flex flex-col items-center gap-4">
              <h3 className="font-display text-xl font-semibold text-text sm:text-2xl">
                Une autre question ?
              </h3>
              <p className="max-w-md text-sm leading-relaxed text-text-muted sm:text-base">
                Parlons-en directement : on répond personnellement à chaque message et on
                fait le point sur votre projet, sans engagement.
              </p>
              <Button
                href={reservationHref}
                size="lg"
                leftIcon={<LuCalendarCheck />}
                rightIcon={<LuArrowRight />}
                onClick={scrollToReservation}
                className="mt-1 w-full sm:w-auto"
              >
                Réserver un appel découverte
              </Button>
            </div>
          </div>
        </motion.div>
      </Container>
    </Section>
  );
}
