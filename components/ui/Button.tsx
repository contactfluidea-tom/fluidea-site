"use client";

import Link from "next/link";
import {
  useRef,
  type ComponentPropsWithoutRef,
  type MouseEvent,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

const baseClasses = cn(
  "relative inline-flex select-none items-center justify-center rounded-full font-medium whitespace-nowrap",
  "transition-[transform,box-shadow,background-color,border-color,color,filter] duration-300 ease-out",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
  "disabled:pointer-events-none disabled:opacity-50"
);

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-gradient text-bg shadow-glow-sm hover:shadow-glow-lg hover:brightness-105 active:brightness-95",
  secondary:
    "border border-primary/40 bg-transparent text-text hover:border-primary hover:bg-primary/10 hover:shadow-glow-sm",
  ghost: "bg-transparent text-text hover:bg-white/5 hover:text-primary-soft",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 gap-1.5 px-4 text-sm",
  md: "h-11 gap-2 px-6 text-sm",
  lg: "h-14 gap-2.5 px-8 text-base",
};

interface BaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Effet magnétique au survol. Actif par défaut sur la variante `primary`. */
  magnetic?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  className?: string;
  children: ReactNode;
}

/** Bouton `<button>` (sans `href`). */
type ButtonAsButton = BaseProps &
  Omit<ComponentPropsWithoutRef<"button">, keyof BaseProps> & { href?: undefined };

/** Lien stylé en bouton (`<a>` via next/link, avec `href`). */
type ButtonAsLink = BaseProps &
  Omit<ComponentPropsWithoutRef<"a">, keyof BaseProps> & { href: string };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

/**
 * Bouton polymorphe (rend un `<button>` ou un lien next/link si `href`).
 *
 * Variantes : `primary` (dégradé orange + glow + magnétique), `secondary`
 * (outline) et `ghost`. Trois tailles, focus visible accessible, et effet
 * magnétique automatiquement neutralisé si reduced-motion est actif.
 */
export function Button(props: ButtonProps) {
  const {
    variant = "primary",
    size = "md",
    magnetic,
    leftIcon,
    rightIcon,
    className,
    children,
    href,
    disabled,
    onMouseMove,
    onMouseLeave,
    ...rest
  } = props as BaseProps & {
    href?: string;
    disabled?: boolean;
    onMouseMove?: (event: MouseEvent<HTMLElement>) => void;
    onMouseLeave?: (event: MouseEvent<HTMLElement>) => void;
  } & Record<string, unknown>;

  const reducedMotion = useReducedMotion();
  const innerRef = useRef<HTMLAnchorElement & HTMLButtonElement>(null);

  const isMagnetic = (magnetic ?? variant === "primary") && !reducedMotion && !disabled;

  const handleMove = (event: MouseEvent<HTMLElement>) => {
    if (isMagnetic && innerRef.current) {
      const rect = innerRef.current.getBoundingClientRect();
      const offsetX = (event.clientX - rect.left - rect.width / 2) * 0.25;
      const offsetY = (event.clientY - rect.top - rect.height / 2) * 0.4;
      innerRef.current.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    }
    onMouseMove?.(event);
  };

  const handleLeave = (event: MouseEvent<HTMLElement>) => {
    if (innerRef.current) {
      innerRef.current.style.transform = "translate(0px, 0px)";
    }
    onMouseLeave?.(event);
  };

  const classes = cn(baseClasses, sizeClasses[size], variantClasses[variant], className);

  const content = (
    <>
      {leftIcon ? (
        <span aria-hidden="true" className="inline-flex shrink-0 text-[1.1em]">
          {leftIcon}
        </span>
      ) : null}
      {children}
      {rightIcon ? (
        <span aria-hidden="true" className="inline-flex shrink-0 text-[1.1em]">
          {rightIcon}
        </span>
      ) : null}
    </>
  );

  if (href !== undefined) {
    return (
      <Link
        ref={innerRef}
        href={href}
        className={cn(classes, disabled && "pointer-events-none opacity-50")}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : undefined}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        {...(rest as ComponentPropsWithoutRef<"a">)}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      ref={innerRef}
      type="button"
      className={classes}
      disabled={disabled}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      {...(rest as ComponentPropsWithoutRef<"button">)}
    >
      {content}
    </button>
  );
}
