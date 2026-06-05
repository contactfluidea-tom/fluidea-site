"use client";

import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type Tag = "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";

interface AnimatedTextProps {
  text: string;
  /** Balise rendue (`span` par défaut). Pour un titre : `h1`…`h4`. */
  as?: Tag;
  className?: string;
  /** Applique le dégradé de marque à chaque mot. */
  gradient?: boolean;
  /** Délai avant le début de la révélation (en secondes). */
  delay?: number;
  /** Intervalle entre chaque mot (en secondes). */
  stagger?: number;
  /** N'animer qu'une seule fois (par défaut) ou à chaque entrée à l'écran. */
  once?: boolean;
}

const containerVariants = (stagger: number, delay: number): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: stagger, delayChildren: delay },
  },
});

const wordVariants: Variants = {
  hidden: { opacity: 0, y: "0.4em", filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: "0em",
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

/**
 * Révélation mot par mot au scroll (fondu + montée + flou) via Framer Motion.
 *
 * Accessibilité : le texte complet est exposé via `aria-label` et chaque mot
 * animé est masqué aux lecteurs d'écran. Si reduced-motion est actif, le texte
 * est rendu directement, sans découpage ni animation.
 */
export function AnimatedText({
  text,
  as = "span",
  className,
  gradient = false,
  delay = 0,
  stagger = 0.05,
  once = true,
}: AnimatedTextProps) {
  const reducedMotion = useReducedMotion();
  const Tag = as;

  if (reducedMotion) {
    return <Tag className={cn(className, gradient && "text-gradient")}>{text}</Tag>;
  }

  const MotionContainer = motion[as] as typeof motion.span;
  const words = text.split(" ");

  return (
    <MotionContainer
      className={className}
      variants={containerVariants(stagger, delay)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: 0.3 }}
      aria-label={text}
    >
      {words.map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          aria-hidden="true"
          variants={wordVariants}
          className={cn("inline-block", gradient && "text-gradient")}
          style={{ marginRight: "0.25em" }}
        >
          {word}
        </motion.span>
      ))}
    </MotionContainer>
  );
}
