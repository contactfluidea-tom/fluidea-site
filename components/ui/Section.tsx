import type { ElementType, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface SectionProps extends HTMLAttributes<HTMLElement> {
  /** Élément rendu (`section` par défaut). */
  as?: ElementType;
}

/**
 * Bloc de section avec espacement vertical cohérent et `scroll-mt`
 * pour que les ancres (#id) ne soient pas masquées par un header sticky.
 */
export function Section({
  as: Tag = "section",
  id,
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <Tag
      id={id}
      className={cn("relative scroll-mt-24 py-20 sm:py-28 lg:py-32", className)}
      {...props}
    >
      {children}
    </Tag>
  );
}
