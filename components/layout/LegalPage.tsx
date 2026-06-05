import Link from "next/link";
import type { ReactNode } from "react";
import { LuChevronRight } from "react-icons/lu";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg";

/** Classe partagée pour les liens dans le corps des pages légales. */
export const legalLinkClass = cn(
  "rounded text-primary underline-offset-2 transition-colors hover:underline",
  FOCUS_RING
);

/**
 * Coquille des pages légales (Mentions légales, Politique de confidentialité) :
 * fil d'Ariane discret, H1 unique, intro courte, date de mise à jour, puis le
 * contenu. Mise en page sobre et lisible, cohérente avec le design du site.
 * Composant serveur (présentationnel, sans état).
 */
export function LegalPage({
  title,
  intro,
  updatedAt,
  children,
}: {
  title: string;
  intro: string;
  updatedAt: string;
  children: ReactNode;
}) {
  return (
    <main className="relative overflow-hidden pb-20 pt-28 sm:pb-28 sm:pt-32">
      {/* Halo orange discret en haut */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64"
        style={{
          background:
            "radial-gradient(50% 100% at 50% 0%, rgba(255,107,44,0.10), transparent 70%)",
        }}
      />

      <Container className="max-w-3xl">
        {/* Fil d'Ariane */}
        <nav aria-label="Fil d'Ariane" className="mb-8">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs text-text-muted">
            <li>
              <Link href="/" className={cn("rounded transition-colors hover:text-text", FOCUS_RING)}>
                Accueil
              </Link>
            </li>
            <li aria-hidden="true" className="text-text-muted/50">
              <LuChevronRight className="h-3.5 w-3.5" />
            </li>
            <li aria-current="page" className="text-text">
              {title}
            </li>
          </ol>
        </nav>

        <h1 className="font-display text-display-sm font-semibold text-text sm:text-display-md">
          {title}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-text-muted sm:text-lg">{intro}</p>
        <p className="mt-2 text-sm text-text-muted/70">Dernière mise à jour : {updatedAt}</p>

        <div className="mt-10 flex flex-col gap-10">{children}</div>
      </Container>
    </main>
  );
}

/** Une rubrique de page légale : titre (h2) + corps de texte. */
export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-xl font-semibold text-text sm:text-2xl">{title}</h2>
      <div className="mt-3 space-y-4 text-sm leading-relaxed text-text-muted sm:text-base">
        {children}
      </div>
    </section>
  );
}
