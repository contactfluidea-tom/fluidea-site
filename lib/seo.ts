import { SOCIALS } from "./socials";
import { FAQ_ITEMS } from "./faq";

/**
 * Source unique des constantes SEO de Fluidea + générateurs de données
 * structurées (JSON-LD). Centralisé ici pour rester cohérent entre `layout`,
 * `page`, `sitemap`, `robots` et `manifest`.
 *
 * `NEXT_PUBLIC_SITE_URL` doit pointer vers le vrai domaine en production
 * (sert au `canonical`, à l'Open Graph et au sitemap). Repli sur le domaine de
 * production (fluidea.pro) si la variable n'est pas définie.
 */
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://fluidea.pro").replace(
  /\/$/,
  ""
);

export const SITE = {
  name: "Fluidea",
  url: SITE_URL,
  email: "contact.fluidea@gmail.com",
  locale: "fr_FR",
  title: "Fluidea — Automatisation IA sur-mesure (n8n + Claude)",
  description:
    "Fluidea conçoit des systèmes d'automatisation IA sur-mesure — n8n + Claude — pour les entrepreneurs, freelances et PME : audit, conception, mise en production et suivi.",
} as const;

/** Mots-clés SEO (orientés automatisation IA, n8n, Claude, audit, freelances/PME). */
export const SITE_KEYWORDS = [
  "automatisation IA",
  "n8n",
  "Claude",
  "audit d'automatisation",
  "intelligence artificielle",
  "freelances",
  "PME",
  "automatisation de tâches",
  "workflow",
  "gain de temps",
];

/** Offres exposées dans les données structurées (cf. section Tarifs). */
const OFFERS = [
  {
    name: "Audit Automatisation",
    description: "Audit de vos process et plan d'action priorisé, prêt à déployer.",
  },
  {
    name: "Système sur-mesure",
    description:
      "Conception et implémentation complète de systèmes d'automatisation n8n + Claude.",
  },
  {
    name: "Formation",
    description: "Formation à l'IA et à l'automatisation pour devenir autonome.",
  },
];

/** JSON-LD `ProfessionalService` (présent sur tout le site, via le layout). */
export function getOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    email: SITE.email,
    image: `${SITE.url}/opengraph-image`,
    logo: `${SITE.url}/icon`,
    priceRange: "€€",
    areaServed: { "@type": "Country", name: "France" },
    contactPoint: {
      "@type": "ContactPoint",
      email: SITE.email,
      contactType: "customer support",
      areaServed: "FR",
      availableLanguage: ["French"],
    },
    sameAs: SOCIALS.map((social) => social.href),
    makesOffer: OFFERS.map((offer) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: offer.name,
        description: offer.description,
      },
    })),
  };
}

/** JSON-LD `FAQPage` (page d'accueil), construit à partir de `FAQ_ITEMS`. */
export function getFaqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}
