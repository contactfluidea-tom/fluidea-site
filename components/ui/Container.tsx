import type { ElementType, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ContainerProps extends HTMLAttributes<HTMLElement> {
  /** Élément rendu (`div` par défaut). Permet `main`, `header`, etc. */
  as?: ElementType;
}

/**
 * Conteneur centré à largeur maximale, avec paddings horizontaux
 * responsives. Garantit un alignement cohérent sur tout le site.
 */
export function Container({ as: Tag = "div", className, children, ...props }: ContainerProps) {
  return (
    <Tag
      className={cn("mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12", className)}
      {...props}
    >
      {children}
    </Tag>
  );
}
