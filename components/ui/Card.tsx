import type { ElementType, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Élément rendu (`div` par défaut). Utiliser `article`, `li`… si besoin. */
  as?: ElementType;
}

/**
 * Carte glassmorphism. Au survol : léger soulèvement, bordure orange et
 * halo lumineux. La classe `group` permet aux enfants de réagir au hover.
 */
export function Card({ as: Tag = "div", className, children, ...props }: CardProps) {
  return (
    <Tag
      className={cn(
        "glass group relative rounded-2xl p-6 sm:p-8",
        "transition-[transform,box-shadow,border-color] duration-300 ease-out",
        "hover:-translate-y-1 hover:border-primary/50 hover:shadow-glow-md",
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
