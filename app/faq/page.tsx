import type { Metadata } from "next";
import Link from "next/link";
import { LuChevronRight } from "react-icons/lu";
import { Container } from "@/components/ui/Container";
import { Faq } from "@/components/sections/Faq";
import { SplineScene } from "@/components/spline/SplineScene";
import { PageTransition } from "@/components/layout/PageTransition";
import { cn } from "@/lib/utils";
import { getFaqJsonLd } from "@/lib/seo";

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg";

export const metadata: Metadata = {
  title: { absolute: "FAQ — Fluidea" },
  description:
    "Questions fréquentes sur l'automatisation IA sur-mesure avec Fluidea (n8n + Claude) : tarifs, appel découverte, sécurité des données, accompagnement et suivi.",
  alternates: { canonical: "/faq" },
};

/**
 * Page dédiée « Questions fréquentes » (/faq). Reprend la section FAQ de
 * l'accueil (accordéon accessible + encart de contact) avec un titre élevé en
 * `h1`, un fil d'Ariane discret et une ambiance 3D Spline en arrière-plan,
 * harmonisée avec le Hero (fond sombre + halos orange) et toujours subtile pour
 * préserver la lisibilité. Données structurées `FAQPage` pour les rich results.
 */
export default function FaqPage() {
  return (
    <>
      {/* Données structurées : FAQ (rich results) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getFaqJsonLd()) }}
      />

      <main className="relative overflow-hidden pt-28 sm:pt-32">
        {/* Ambiance 3D Spline — bande supérieure, derrière le contenu, non-interactive */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[78vh] overflow-hidden"
        >
          <SplineScene className="opacity-70" />
          {/* Voiles de lisibilité harmonisés avec le Hero */}
          <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/70 to-transparent sm:via-bg/55" />
          <div className="absolute inset-0 bg-gradient-to-b from-bg/30 via-bg/40 to-bg" />
        </div>

        <PageTransition className="relative z-10 pb-20 sm:pb-28">
          {/* Fil d'Ariane discret (repris des pages internes) */}
          <Container>
            <nav aria-label="Fil d'Ariane">
              <ol className="flex flex-wrap items-center gap-1.5 text-xs text-text-muted">
                <li>
                  <Link
                    href="/"
                    className={cn("rounded transition-colors hover:text-text", FOCUS_RING)}
                  >
                    Accueil
                  </Link>
                </li>
                <li aria-hidden="true" className="text-text-muted/50">
                  <LuChevronRight className="h-3.5 w-3.5" />
                </li>
                <li aria-current="page" className="text-text">
                  FAQ
                </li>
              </ol>
            </nav>
          </Container>

          {/* Section FAQ existante, titre élevé en h1 pour la page dédiée */}
          <Faq headingAs="h1" />
        </PageTransition>
      </main>
    </>
  );
}
