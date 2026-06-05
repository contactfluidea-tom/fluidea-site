import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "./Badge";
import { AnimatedText } from "./AnimatedText";

type HeadingLevel = "h1" | "h2" | "h3";

const titleSize: Record<HeadingLevel, string> = {
  h1: "text-display-lg",
  h2: "text-display-md",
  h3: "text-display-sm",
};

interface SectionHeadingProps {
  /** Sur-titre affiché dans un Badge glassmorphism. */
  eyebrow?: string;
  eyebrowIcon?: ReactNode;
  /** Titre principal : dégradé de marque + révélation mot par mot au scroll. */
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  /** Niveau sémantique du titre (`h2` par défaut). */
  as?: HeadingLevel;
  className?: string;
}

/**
 * En-tête de section cohérent : sur-titre (Badge) + titre en dégradé animé
 * + sous-titre. Aligné au centre par défaut, ou à gauche.
 */
export function SectionHeading({
  eyebrow,
  eyebrowIcon,
  title,
  subtitle,
  align = "center",
  as = "h2",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className
      )}
    >
      {eyebrow ? <Badge icon={eyebrowIcon}>{eyebrow}</Badge> : null}

      <AnimatedText
        as={as}
        text={title}
        gradient
        className={cn("font-display font-semibold", titleSize[as])}
      />

      {subtitle ? (
        <p
          className={cn(
            "max-w-2xl text-base leading-relaxed text-text-muted sm:text-lg",
            align === "center" && "mx-auto"
          )}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
