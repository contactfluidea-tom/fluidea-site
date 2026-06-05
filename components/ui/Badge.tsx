import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Icône optionnelle. Sans icône, une pastille lumineuse est affichée. */
  icon?: ReactNode;
}

/**
 * Pastille glassmorphism (sur-titre, label, statut…). S'appuie sur la
 * classe `.glass` du design system pour le fond flouté translucide.
 */
export function Badge({ icon, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "glass inline-flex items-center gap-2 rounded-full px-4 py-1.5",
        "text-sm font-medium text-text",
        className
      )}
      {...props}
    >
      {icon ? (
        <span className="inline-flex shrink-0 text-primary" aria-hidden="true">
          {icon}
        </span>
      ) : (
        <span
          className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary shadow-glow-sm"
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
