"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import Image from "next/image";
import {
  LuArrowLeft,
  LuArrowRight,
  LuMessageSquareQuote,
  LuPause,
  LuPlay,
  LuQuote,
  LuStar,
  LuStarHalf,
} from "react-icons/lu";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { TESTIMONIALS, type Testimonial } from "@/lib/testimonials";

// useLayoutEffect côté client, useEffect au rendu serveur (évite l'avertissement
// SSR) : on mesure la piste et on lance le défilement avant la première peinture.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg";

// Réglages du défilement automatique (boucle infinie).
const SPEED = 42; // vitesse de base (px/seconde)
const HOVER_FACTOR = 0.3; // ralenti au survol (× vitesse)
const FACTOR_LERP = 0.06; // lissage du changement de vitesse
const NUDGE_LERP = 0.16; // lissage d'un saut clavier / bouton

/**
 * Ramène un décalage `x` dans l'intervalle `(-w, 0]` (largeur d'un jeu de
 * cartes). Comme la liste est dupliquée, translater de `w` réaligne exactement
 * le second jeu sur le premier : la boucle est ainsi invisible, dans les deux
 * sens (défilement auto comme glisser-déposer).
 */
function normalize(x: number, w: number): number {
  if (!w) return x;
  let m = x % w;
  if (m > 0) m -= w;
  return m;
}

/** Avatar de remplacement : initiales sur dégradé de marque (ou photo si fournie). */
function Avatar({ name, src }: { name: string; src?: string }) {
  if (src) {
    return (
      <Image
        src={src}
        alt=""
        aria-hidden="true"
        width={44}
        height={44}
        className="h-11 w-11 shrink-0 rounded-full object-cover ring-1 ring-white/15"
      />
    );
  }

  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0] ?? "")
    .join("")
    .toUpperCase();

  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid h-11 w-11 shrink-0 place-items-center rounded-full",
        "bg-brand-gradient font-display text-sm font-semibold text-bg shadow-glow-sm"
      )}
    >
      {initials}
    </span>
  );
}

/** Note en étoiles (gère les demi-étoiles). Visuellement décoratif + libellé accessible. */
function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;

  return (
    <div
      role="img"
      aria-label={`Note : ${rating} sur 5`}
      className="flex items-center gap-0.5"
    >
      {Array.from({ length: 5 }).map((_, i) => {
        if (i < full) {
          return (
            <LuStar key={i} aria-hidden="true" className="h-4 w-4 fill-primary text-primary" />
          );
        }
        if (i === full && hasHalf) {
          return (
            <LuStarHalf
              key={i}
              aria-hidden="true"
              className="h-4 w-4 fill-primary text-primary"
            />
          );
        }
        return <LuStar key={i} aria-hidden="true" className="h-4 w-4 text-text-muted/40" />;
      })}
    </div>
  );
}

/** Une carte témoignage (glassmorphism + léger glow orange). */
function TestimonialCard({
  testimonial,
  clone,
}: {
  testimonial: Testimonial;
  /** Carte du jeu dupliqué : masquée aux technologies d'assistance. */
  clone?: boolean;
}) {
  return (
    <article
      role="group"
      aria-roledescription="témoignage"
      aria-label={`Témoignage de ${testimonial.name}, ${testimonial.role}`}
      aria-hidden={clone || undefined}
      className={cn(
        "glass relative flex w-[284px] shrink-0 flex-col rounded-2xl p-6 shadow-glow-sm",
        "ring-1 ring-white/10 sm:w-[340px] sm:p-7 lg:w-[372px]"
      )}
    >
      {/* Léger glow orange en coin (décoratif) */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          background:
            "radial-gradient(120% 75% at 0% 0%, rgba(255,107,44,0.12), transparent 58%)",
        }}
      />

      <div className="relative flex h-full flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <Stars rating={testimonial.rating ?? 5} />
          <LuQuote aria-hidden="true" className="h-7 w-7 shrink-0 text-primary/30" />
        </div>

        <blockquote className="text-[0.95rem] leading-relaxed text-text/90 sm:text-base">
          {"« "}
          {testimonial.quote}
          {" »"}
        </blockquote>

        <footer className="mt-auto flex items-center gap-3 pt-2">
          <Avatar name={testimonial.name} src={testimonial.avatar} />
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-semibold text-text">
              {testimonial.name}
            </p>
            <p className="truncate text-xs text-text-muted">{testimonial.role}</p>
          </div>
        </footer>
      </div>
    </article>
  );
}

/** Bouton de contrôle circulaire (précédent / pause / suivant). */
function ControlButton({
  label,
  controls,
  onClick,
  children,
}: {
  label: string;
  controls: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-controls={controls}
      className={cn(
        "glass grid h-11 w-11 place-items-center rounded-full text-text",
        "transition-[color,border-color,box-shadow,transform] duration-300",
        "hover:-translate-y-0.5 hover:border-primary/50 hover:text-primary hover:shadow-glow-sm",
        FOCUS_RING
      )}
    >
      {children}
    </button>
  );
}

/**
 * Section « Témoignages » : un carrousel/marquee fluide de cartes glassmorphism.
 *
 * Défilement automatique en boucle (rAF), ralenti au survol et mis en pause au
 * focus clavier ou via le bouton dédié. Glisser-déposer à la souris et balayage
 * tactile (Pointer Events) ; flèches précédent/suivant et raccourcis clavier
 * (←/→, Origine, Espace). Bords en fondu (mask) sur les côtés + léger glow.
 *
 * Accessibilité : `aria-roledescription="carrousel"`, zone focalisable, jeu de
 * cartes dupliqué masqué aux lecteurs d'écran (`aria-hidden`). `prefers-reduced-
 * motion` respecté : aucun autoplay (les cartes restent navigables au clavier,
 * au glisser et aux boutons).
 */
export function Testimonials() {
  const reducedMotion = useReducedMotion();
  const count = TESTIMONIALS.length;
  const viewportId = useId();

  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // État de défilement, conservé dans des refs (lu par la boucle rAF sans re-render).
  const offsetRef = useRef(0); // décalage courant (px, négatif = vers la gauche)
  const setWidthRef = useRef(0); // largeur d'un jeu de cartes
  const factorRef = useRef(0); // facteur de vitesse courant (lissé)
  const nudgeRef = useRef(0); // distance restante d'un saut clavier/bouton (px)

  const pausedRef = useRef(false);
  const hoveredRef = useRef(false);
  const focusRef = useRef(false);
  const draggingRef = useRef(false);
  const reducedMotionRef = useRef(false);

  // Glisser-déposer.
  const dragStartX = useRef(0);
  const dragStartOffset = useRef(0);

  const [paused, setPaused] = useState(false);
  const [grabbing, setGrabbing] = useState(false);

  // Miroir des états React → refs (lus dans la boucle d'animation).
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);
  useEffect(() => {
    reducedMotionRef.current = reducedMotion;
  }, [reducedMotion]);

  /** Saut d'une carte : `dir = +1` (précédent) déplace le contenu vers la droite. */
  const nudge = useCallback(
    (dir: number) => {
      const step = setWidthRef.current / count;
      nudgeRef.current += dir * step;
    },
    [count]
  );

  // Boucle de défilement (rAF) : mesure, autoplay, sauts, fondu de vitesse.
  useIsomorphicLayoutEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    const measure = () => {
      // 1ère carte du jeu dupliqué : son offset = largeur exacte d'un jeu (gap inclus).
      const second = track.children[count] as HTMLElement | undefined;
      setWidthRef.current = second ? second.offsetLeft : 0;
      offsetRef.current = normalize(offsetRef.current, setWidthRef.current);
      track.style.transform = `translate3d(${offsetRef.current}px,0,0)`;
    };
    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(track);

    let raf = 0;
    let last = 0;
    let running = false;

    const frame = (now: number) => {
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      const w = setWidthRef.current;

      if (w > 0) {
        // Vitesse cible selon l'état (pause/focus/reduced-motion → arrêt ; survol → ralenti).
        let target: number;
        if (
          pausedRef.current ||
          draggingRef.current ||
          focusRef.current ||
          reducedMotionRef.current
        ) {
          target = 0;
        } else if (hoveredRef.current) {
          target = HOVER_FACTOR;
        } else {
          target = 1;
        }
        factorRef.current += (target - factorRef.current) * FACTOR_LERP;

        if (!draggingRef.current) {
          // Autoplay (vers la gauche).
          offsetRef.current -= SPEED * factorRef.current * dt;

          // Saut clavier / bouton en cours.
          const n = nudgeRef.current;
          if (n !== 0) {
            if (reducedMotionRef.current) {
              offsetRef.current += n;
              nudgeRef.current = 0;
            } else {
              const move = n * NUDGE_LERP;
              offsetRef.current += move;
              nudgeRef.current = n - move;
              if (Math.abs(nudgeRef.current) < 0.5) {
                offsetRef.current += nudgeRef.current;
                nudgeRef.current = 0;
              }
            }
          }
        }

        offsetRef.current = normalize(offsetRef.current, w);
        track.style.transform = `translate3d(${offsetRef.current}px,0,0)`;
      }

      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (running) return;
      running = true;
      last = 0;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      if (!running) return;
      running = false;
      cancelAnimationFrame(raf);
    };

    // N'anime que lorsque la section est visible (économie de batterie).
    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { threshold: 0 }
    );
    io.observe(viewport);

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
    };
  }, [count]);

  // --- Glisser-déposer (souris) / balayage (tactile) via Pointer Events ---
  const onPointerDown = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 && event.pointerType === "mouse") return;
    draggingRef.current = true;
    dragStartX.current = event.clientX;
    dragStartOffset.current = offsetRef.current;
    setGrabbing(true);
    viewportRef.current?.setPointerCapture?.(event.pointerId);
  }, []);

  const onPointerMove = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    const dx = event.clientX - dragStartX.current;
    offsetRef.current = normalize(dragStartOffset.current + dx, setWidthRef.current);
    if (trackRef.current) {
      trackRef.current.style.transform = `translate3d(${offsetRef.current}px,0,0)`;
    }
  }, []);

  const endDrag = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setGrabbing(false);
    viewportRef.current?.releasePointerCapture?.(event.pointerId);
  }, []);

  // --- Survol (souris) et focus clavier ---
  const onMouseEnter = useCallback(() => {
    hoveredRef.current = true;
  }, []);
  const onMouseLeave = useCallback(() => {
    hoveredRef.current = false;
  }, []);

  const onFocus = useCallback(() => {
    // On ne met en pause que pour un focus clavier (pas un clic souris).
    try {
      focusRef.current = viewportRef.current?.matches(":focus-visible") ?? true;
    } catch {
      focusRef.current = true;
    }
  }, []);
  const onBlur = useCallback(() => {
    focusRef.current = false;
  }, []);

  // --- Contrôles clavier ---
  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault();
          nudge(1); // précédent
          break;
        case "ArrowRight":
          event.preventDefault();
          nudge(-1); // suivant
          break;
        case "Home":
          event.preventDefault();
          nudgeRef.current = 0;
          offsetRef.current = 0;
          break;
        case " ":
        case "Spacebar":
          if (!reducedMotion) {
            event.preventDefault();
            setPaused((value) => !value);
          }
          break;
        default:
      }
    },
    [nudge, reducedMotion]
  );

  return (
    <Section id="temoignages" aria-label="Témoignages clients">
      <Container>
        <SectionHeading
          eyebrow="Témoignages"
          eyebrowIcon={<LuMessageSquareQuote />}
          title="Ils me font confiance"
          subtitle="Entrepreneurs, freelances et dirigeants de PME : voici ce que l'automatisation sur-mesure a changé pour eux."
        />
      </Container>

      {/* Piste plein écran : le fondu des bords (mask) atteint ainsi les bords de l'écran. */}
      <div className="relative mt-12 sm:mt-16">
        {/* Halo orange diffus derrière la piste (décoratif) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 h-64 -translate-y-1/2"
          style={{
            background:
              "radial-gradient(50% 60% at 50% 50%, rgba(255,107,44,0.12), transparent 70%)",
          }}
        />

        <div
          ref={viewportRef}
          id={viewportId}
          role="group"
          aria-roledescription="carrousel"
          aria-label="Témoignages de clients — défilement automatique"
          tabIndex={0}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onLostPointerCapture={endDrag}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onFocus={onFocus}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          className={cn(
            "select-none touch-pan-y overflow-hidden rounded-2xl py-2",
            grabbing ? "cursor-grabbing" : "cursor-grab",
            FOCUS_RING
          )}
          // Bords en fondu sur les côtés.
          style={{
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0, #000 8%, #000 92%, transparent 100%)",
            maskImage:
              "linear-gradient(to right, transparent 0, #000 8%, #000 92%, transparent 100%)",
          }}
        >
          <div
            ref={trackRef}
            className="flex w-max items-stretch gap-5 px-5 will-change-transform sm:gap-6"
          >
            {/* Jeu réel (annoncé aux lecteurs d'écran) */}
            {TESTIMONIALS.map((testimonial) => (
              <TestimonialCard key={testimonial.key} testimonial={testimonial} />
            ))}
            {/* Jeu dupliqué pour la boucle infinie (masqué aux technologies d'assistance) */}
            {TESTIMONIALS.map((testimonial) => (
              <TestimonialCard
                key={`${testimonial.key}-clone`}
                testimonial={testimonial}
                clone
              />
            ))}
          </div>
        </div>
      </div>

      {/* Contrôles : précédent / pause / suivant */}
      <Container>
        <div className="mt-8 flex items-center justify-center gap-3">
          <ControlButton
            label="Témoignage précédent"
            controls={viewportId}
            onClick={() => nudge(1)}
          >
            <LuArrowLeft aria-hidden="true" className="h-5 w-5" />
          </ControlButton>

          {!reducedMotion && (
            <ControlButton
              label={paused ? "Reprendre le défilement" : "Mettre le défilement en pause"}
              controls={viewportId}
              onClick={() => setPaused((value) => !value)}
            >
              {paused ? (
                <LuPlay aria-hidden="true" className="h-5 w-5" />
              ) : (
                <LuPause aria-hidden="true" className="h-5 w-5" />
              )}
            </ControlButton>
          )}

          <ControlButton
            label="Témoignage suivant"
            controls={viewportId}
            onClick={() => nudge(-1)}
          >
            <LuArrowRight aria-hidden="true" className="h-5 w-5" />
          </ControlButton>
        </div>
      </Container>
    </Section>
  );
}
