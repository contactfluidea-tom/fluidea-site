"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { LuCalendarClock, LuExternalLink, LuTriangleAlert } from "react-icons/lu";
import { Button } from "./Button";
import { cn } from "@/lib/utils";

/** URL Calendly par défaut (surchargée par `NEXT_PUBLIC_CALENDLY_URL`). */
const DEFAULT_URL = "https://calendly.com/fluidea-appel/appel-decouverte";
const SCRIPT_SRC = "https://assets.calendly.com/assets/external/widget.js";
const CSS_HREF = "https://assets.calendly.com/assets/external/widget.css";

// Couleurs de marque appliquées au widget via les paramètres d'URL Calendly
// (hex sans « # »). Fond sombre + accent orange, pour s'accorder au site.
const BRAND_PARAMS: Record<string, string> = {
  background_color: "0a0a0f",
  text_color: "f5f5f7",
  primary_color: "ff6b2c",
  hide_gdpr_banner: "1",
};

declare global {
  interface Window {
    Calendly?: {
      initInlineWidget: (options: {
        url: string;
        parentElement: HTMLElement;
      }) => void;
    };
  }
}

/** Injecte la feuille de style Calendly (spinner + dimensions) une seule fois. */
function ensureStylesheet() {
  if (document.querySelector("link[data-calendly]")) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = CSS_HREF;
  link.setAttribute("data-calendly", "");
  document.head.appendChild(link);
}

/** Crée (ou réutilise) le script Calendly, chargé en asynchrone. */
function ensureScript(): HTMLScriptElement {
  let script = document.querySelector<HTMLScriptElement>("script[data-calendly]");
  if (!script) {
    script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.setAttribute("data-calendly", "");
    document.body.appendChild(script);
  }
  return script;
}

interface CalendlyEmbedProps {
  /** URL Calendly de base. Défaut : `NEXT_PUBLIC_CALENDLY_URL` ou l'URL Fluidea. */
  url?: string;
  /** Hauteur du widget (px). */
  minHeight?: number;
  className?: string;
}

/**
 * Widget Calendly inline, chargé proprement côté client (script asynchrone
 * injecté après hydratation : il ne bloque pas le rendu initial). Les couleurs
 * du widget sont accordées à la marque via les paramètres d'URL Calendly.
 *
 * États gérés : chargement (spinner), prêt (créneaux affichés) et échec — dans
 * ce dernier cas (script bloqué, hors-ligne…), un bouton de repli « Ouvrir le
 * calendrier » renvoie vers la page Calendly dans un nouvel onglet.
 */
export function CalendlyEmbed({ url, minHeight = 700, className }: CalendlyEmbedProps) {
  const baseUrl = url || process.env.NEXT_PUBLIC_CALENDLY_URL || DEFAULT_URL;

  // URL enrichie des couleurs de marque (réutilisée par le widget et le repli).
  const widgetUrl = useMemo(() => {
    try {
      const parsed = new URL(baseUrl);
      for (const [key, value] of Object.entries(BRAND_PARAMS)) {
        parsed.searchParams.set(key, value);
      }
      return parsed.toString();
    } catch {
      return baseUrl;
    }
  }, [baseUrl]);

  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let done = false;
    const markReady = () => {
      if (!done) {
        done = true;
        setStatus("ready");
      }
    };
    const markError = () => {
      if (!done) {
        done = true;
        setStatus("error");
      }
    };

    // Le widget signale son chargement via des messages « calendly.* ».
    const onMessage = (event: MessageEvent) => {
      const data = event.data;
      if (
        data &&
        typeof data === "object" &&
        String((data as { event?: unknown }).event ?? "").startsWith("calendly.")
      ) {
        markReady();
      }
    };
    window.addEventListener("message", onMessage);

    const initWidget = () => {
      if (done || !window.Calendly || !containerRef.current) return;
      // Évite les doublons (re-init, StrictMode en dev).
      containerRef.current.innerHTML = "";
      window.Calendly.initInlineWidget({
        url: widgetUrl,
        parentElement: containerRef.current,
      });
    };

    ensureStylesheet();

    let script: HTMLScriptElement | null = null;
    const onScriptLoad = () => initWidget();
    const onScriptError = () => markError();

    if (window.Calendly) {
      initWidget();
    } else {
      script = ensureScript();
      script.addEventListener("load", onScriptLoad);
      script.addEventListener("error", onScriptError);
    }

    // Filet de sécurité : certains bloqueurs n'émettent pas d'événement « error ».
    // À échéance, on accepte le widget si l'iframe est présente, sinon on bascule
    // sur le bouton de repli.
    const safety = window.setTimeout(() => {
      if (container.querySelector("iframe")) markReady();
      else markError();
    }, 12000);

    return () => {
      done = true;
      window.removeEventListener("message", onMessage);
      window.clearTimeout(safety);
      if (script) {
        script.removeEventListener("load", onScriptLoad);
        script.removeEventListener("error", onScriptError);
      }
    };
  }, [widgetUrl]);

  return (
    <div className={cn("relative w-full", className)}>
      {/* Conteneur du widget inline (Calendly y injecte une iframe). */}
      <div
        ref={containerRef}
        role="region"
        aria-label="Calendrier de réservation"
        aria-busy={status === "loading"}
        className={cn(
          "w-full overflow-hidden rounded-2xl",
          status === "error" && "hidden"
        )}
        style={{ minWidth: 320, height: minHeight }}
      />

      {/* Pendant le chargement : indicateur par-dessus le conteneur. */}
      {status === "loading" ? (
        <div
          role="status"
          className="pointer-events-none absolute inset-0 grid place-items-center"
        >
          <div className="flex flex-col items-center gap-3 text-text-muted">
            <LuCalendarClock aria-hidden="true" className="h-8 w-8 animate-pulse text-primary" />
            <span className="text-sm">Chargement du calendrier…</span>
          </div>
        </div>
      ) : null}

      {/* Repli : le widget n'a pas pu se charger → lien direct vers Calendly. */}
      {status === "error" ? (
        <div
          className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-12 text-center"
          style={{ minHeight }}
        >
          <span
            aria-hidden="true"
            className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20"
          >
            <LuTriangleAlert className="h-6 w-6" />
          </span>
          <div className="flex flex-col gap-1">
            <p className="font-display text-base font-semibold text-text">
              Le calendrier ne s&apos;est pas chargé
            </p>
            <p className="mx-auto max-w-xs text-sm text-text-muted">
              Un bloqueur ou votre connexion l&apos;empêche peut-être de s&apos;afficher.
              Ouvrez-le directement dans un nouvel onglet.
            </p>
          </div>
          <Button
            href={widgetUrl}
            target="_blank"
            rel="noopener noreferrer"
            rightIcon={<LuExternalLink />}
          >
            Ouvrir le calendrier
          </Button>
        </div>
      ) : null}
    </div>
  );
}
