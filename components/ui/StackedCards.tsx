"use client";

import {
  Children,
  useEffect,
  useLayoutEffect,
  useRef,
  type ReactNode,
} from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

// useLayoutEffect côté client, useEffect au rendu serveur (évite l'avertissement
// SSR de React) : on prépare l'effet GSAP avant la première peinture.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export interface StackedCardsProps {
  /** Une carte par enfant. L'ordre du DOM est conservé. */
  children: ReactNode;
  /** Libellé accessible de la pile (role="list"). */
  ariaLabel?: string;
  /** Classes du conteneur externe (ex. marge haute). */
  className?: string;
}

/**
 * Effet « stacked cards on scroll ».
 *
 * Sur grand écran et si le mouvement est autorisé, la zone des cartes est
 * épinglée (GSAP ScrollTrigger `pin` + `scrub`) pendant que les cartes montent
 * une à une et se superposent en pile : chaque carte qui passe derrière est
 * réduite (`scale`) et décalée vers le haut (`translateY`) pour révéler la
 * profondeur. La distance d'épinglage vaut ≈ 100vh par carte (gérée par le
 * `pinSpacing` de ScrollTrigger) ; une fois la dernière empilée, l'épinglage se
 * libère et la suite de la page défile normalement.
 *
 * Repli (≤ lg ou `prefers-reduced-motion`) : simple empilement vertical
 * statique, lisible, sans épinglage ni animation. La synchronisation Lenis ↔
 * ScrollTrigger est assurée globalement par le SmoothScrollProvider ; on se
 * contente de rafraîchir après l'init et de recalculer la hauteur au resize.
 */
export function StackedCards({ children, ariaLabel, className }: StackedCardsProps) {
  const items = Children.toArray(children);
  const count = items.length;

  const containerRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const deckRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useIsomorphicLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const mm = gsap.matchMedia();

    // Effet épinglé : grands écrans uniquement, et seulement si le mouvement
    // est autorisé. Sinon, le DOM reste une pile verticale statique.
    mm.add(
      "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
      () => {
        const pin = pinRef.current;
        const deck = deckRef.current;
        const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
        if (!pin || !deck || cards.length < 2) return;

        const measure = () => Math.max(...cards.map((card) => card.offsetHeight));

        // 1) Passage en mode « pile » (styles structurels, remis à plat au cleanup).
        //    flex-col + justify-center centre la pile verticalement ; la largeur
        //    reste pleine (align-items:stretch + w-full). NE PAS utiliser
        //    items-center : le deck n'ayant que des enfants en position absolue,
        //    sa largeur s'effondrerait à 0.
        pin.classList.add("flex", "flex-col", "justify-center");
        pin.style.minHeight = "100vh";
        deck.style.position = "relative";
        deck.style.height = `${measure()}px`; // mesuré tant que les cartes sont en flux
        cards.forEach((card) => {
          card.style.position = "absolute";
          card.style.top = "0";
          card.style.left = "0";
          card.style.right = "0";
          card.style.willChange = "transform";
          // Fond opaque (couleur de page) + arrondi de la carte : chaque carte
          // occulte proprement celles du dessous. Sans ça, le glassmorphism
          // translucide laisse transparaître les cartes empilées dessous.
          // Retiré au cleanup → le verre reste intact hors mode pile.
          card.style.backgroundColor = "#0A0A0F";
          card.style.borderRadius = "1.5rem";
        });

        const applyDeckHeight = () => {
          deck.style.height = `${measure()}px`;
        };

        // 2) État initial : 1re carte au front, les suivantes en dessous, masquées.
        gsap.set(cards, { transformOrigin: "center top" });
        cards.forEach((card, i) =>
          gsap.set(card, {
            yPercent: i === 0 ? 0 : 100,
            opacity: i === 0 ? 1 : 0,
            scale: 1,
          })
        );

        // 3) Timeline liée au scroll (scrub) qui empile les cartes. Le wrapper est
        //    épinglé ; `pinSpacing` réserve ≈ 100vh par carte de distance de
        //    défilement et raccorde proprement la suite de la page (compteurs).
        const tl = gsap.timeline({
          defaults: { ease: "none", duration: 1 },
          scrollTrigger: {
            trigger: pin,
            start: "top top",
            end: () => "+=" + cards.length * window.innerHeight,
            scrub: true,
            pin,
            pinSpacing: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        for (let i = 1; i < cards.length; i++) {
          // La carte i monte depuis le bas et devient le front.
          tl.to(cards[i], { yPercent: 0, opacity: 1 }, i - 1);
          // Les cartes déjà posées reculent (réduites + décalées vers le haut),
          // profondeur bornée à 3 niveaux pour rester lisible.
          for (let j = 0; j < i; j++) {
            const depth = Math.min(i - j, 3);
            tl.to(
              cards[j],
              { scale: 1 - depth * 0.05, yPercent: -depth * 7 },
              i - 1
            );
          }
        }

        // 4) Recalcule la hauteur de la pile à chaque refresh (resize inclus).
        ScrollTrigger.addEventListener("refreshInit", applyDeckHeight);

        return () => {
          ScrollTrigger.removeEventListener("refreshInit", applyDeckHeight);
          pin.classList.remove("flex", "flex-col", "justify-center");
          pin.style.minHeight = "";
          deck.style.position = "";
          deck.style.height = "";
          cards.forEach((card) => {
            card.style.position = "";
            card.style.top = "";
            card.style.left = "";
            card.style.right = "";
            card.style.willChange = "";
            card.style.backgroundColor = "";
            card.style.borderRadius = "";
          });
        };
      }
    );

    // Init : positionne correctement le pin une fois le layout prêt.
    ScrollTrigger.refresh();

    // Démontage : kill des ScrollTrigger + revert des tweens/sets et des styles.
    return () => mm.revert();
  }, [count]);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div ref={pinRef}>
        <div
          ref={deckRef}
          role="list"
          aria-label={ariaLabel}
          className="flex w-full flex-col gap-6 lg:gap-8"
        >
          {items.map((item, i) => (
            <div
              key={i}
              role="listitem"
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              className="w-full"
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
