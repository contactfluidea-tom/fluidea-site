import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection, legalLinkClass } from "@/components/layout/LegalPage";

export const metadata: Metadata = {
  title: "Mentions légales",
  description:
    "Mentions légales du site Fluidea : éditeur, hébergeur et informations légales.",
  alternates: { canonical: "/mentions-legales" },
};

/*
 * ⚠️ MODÈLE à compléter par Tom : renseigner les champs entre crochets [ ] et
 * faire valider par un professionnel. Ceci n'est pas un conseil juridique.
 */
export default function MentionsLegalesPage() {
  return (
    <LegalPage
      title="Mentions légales"
      intro="Informations légales relatives au site Fluidea et à son éditeur, conformément à la loi pour la confiance dans l'économie numérique (LCEN)."
      updatedAt="juin 2026"
    >
      <LegalSection title="Éditeur du site">
        <p>Le site fluidea (ci-après « le Site ») est édité par :</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Fluidea — micro-entreprise (Entrepreneur Individuel)</li>
          <li>Représentant : Tom Attinetti</li>
          <li>Adresse : 12 Ruelle du Moulin, 57220 Varize-Vaudoncourt, France</li>
          <li>
            Téléphone :{" "}
            <a href="tel:+33782156155" className={legalLinkClass}>
              07 82 15 61 55
            </a>
          </li>
          <li>
            E-mail :{" "}
            <a href="mailto:contact.fluidea@gmail.com" className={legalLinkClass}>
              contact.fluidea@gmail.com
            </a>
          </li>
          <li>SIRET : 99892750300016 — SIREN : 998 927 503</li>
          <li>TVA non applicable, art. 293 B du CGI</li>
        </ul>
      </LegalSection>

      <LegalSection title="Directeur de la publication">
        <p>Tom Attinetti, en qualité de représentant de Fluidea.</p>
      </LegalSection>

      <LegalSection title="Hébergement">
        <p>Le Site est hébergé par :</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Vercel Inc.</li>
          <li>440 N Barranca Ave #4133, Covina, CA 91723, États-Unis</li>
          <li>
            <a
              href="https://vercel.com"
              target="_blank"
              rel="noopener noreferrer"
              className={legalLinkClass}
            >
              vercel.com
            </a>
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Propriété intellectuelle">
        <p>
          Sauf mention contraire, l&apos;ensemble des contenus du Site (textes, visuels, logo,
          charte graphique, code) est la propriété exclusive de Fluidea ou de ses partenaires.
          Toute reproduction, représentation ou diffusion, totale ou partielle, sans
          autorisation écrite préalable, est interdite et constituerait une contrefaçon.
        </p>
      </LegalSection>

      <LegalSection title="Données personnelles">
        <p>
          Le Site collecte des données via son formulaire de contact et son outil de prise de
          rendez-vous. Les modalités de traitement et vos droits sont détaillés dans la{" "}
          <Link href="/politique-de-confidentialite" className={legalLinkClass}>
            Politique de confidentialité
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="Responsabilité">
        <p>
          Fluidea s&apos;efforce d&apos;assurer l&apos;exactitude et la mise à jour des
          informations diffusées sur le Site, sans pouvoir en garantir l&apos;exhaustivité. Le
          Site peut contenir des liens vers des sites tiers ; Fluidea n&apos;exerce aucun
          contrôle sur ces sites et décline toute responsabilité quant à leur contenu.
        </p>
      </LegalSection>

      <LegalSection title="Droit applicable">
        <p>
          Le présent site et les présentes mentions sont soumis au droit français. En cas de
          litige, et à défaut de résolution amiable, les tribunaux français seront seuls
          compétents.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
