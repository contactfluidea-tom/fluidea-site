import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection, legalLinkClass } from "@/components/layout/LegalPage";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description:
    "Politique de confidentialité de Fluidea : données collectées, finalités, durées de conservation et vos droits (RGPD).",
  alternates: { canonical: "/politique-de-confidentialite" },
};

/*
 * ⚠️ MODÈLE à adapter à la situation réelle de Fluidea (sous-traitants, durées,
 * cookies…) et à faire valider. Ceci n'est pas un conseil juridique.
 */
export default function PolitiqueConfidentialitePage() {
  return (
    <LegalPage
      title="Politique de confidentialité"
      intro="Cette politique explique quelles données personnelles Fluidea collecte, pourquoi, combien de temps elles sont conservées et comment exercer vos droits."
      updatedAt="juin 2026"
    >
      <LegalSection title="Responsable du traitement">
        <p>
          Le responsable du traitement des données est Fluidea — [Prénom NOM]. Pour toute
          question relative à vos données :{" "}
          <a href="mailto:contact.fluidea@gmail.com" className={legalLinkClass}>
            contact.fluidea@gmail.com
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="Données collectées">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong className="font-medium text-text">Formulaire de contact</strong> : nom,
            adresse e-mail, type de besoin et message.
          </li>
          <li>
            <strong className="font-medium text-text">Prise de rendez-vous</strong> (via
            Calendly) : nom, e-mail et créneau réservé.
          </li>
          <li>
            <strong className="font-medium text-text">Données techniques</strong> : données de
            connexion strictement nécessaires au fonctionnement et à la sécurité du Site.
          </li>
        </ul>
        <p>
          Aucune donnée sensible n&apos;est demandée. Les champs marqués comme obligatoires sont
          nécessaires pour traiter votre demande.
        </p>
      </LegalSection>

      <LegalSection title="Finalités et bases légales">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            Répondre à vos demandes envoyées via le formulaire (base légale : mesures
            précontractuelles et intérêt légitime).
          </li>
          <li>
            Organiser un rendez-vous découverte (base légale : votre consentement et mesures
            précontractuelles).
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Destinataires et sous-traitants">
        <p>
          Vos données sont destinées à Fluidea et ne sont jamais vendues. Pour fournir le
          service, Fluidea fait appel à des sous-traitants :{" "}
          <strong className="font-medium text-text">Resend</strong> (acheminement des e-mails),{" "}
          <strong className="font-medium text-text">Calendly</strong> (prise de rendez-vous) et
          [hébergeur]. Ces prestataires n&apos;utilisent vos données que pour la fourniture de
          leur service.
        </p>
      </LegalSection>

      <LegalSection title="Transferts hors Union européenne">
        <p>
          Certains prestataires (notamment Resend et Calendly) sont établis aux États-Unis. Les
          transferts éventuels sont encadrés par des garanties appropriées (clauses
          contractuelles types de la Commission européenne et/ou adhésion au Data Privacy
          Framework).
        </p>
      </LegalSection>

      <LegalSection title="Durée de conservation">
        <p>
          Vos données de contact sont conservées le temps nécessaire au traitement de votre
          demande, puis pendant une durée maximale de [ex. 3 ans] à compter du dernier contact,
          avant suppression ou archivage.
        </p>
      </LegalSection>

      <LegalSection title="Vos droits">
        <p>
          Conformément au RGPD, vous disposez des droits d&apos;accès, de rectification,
          d&apos;effacement, de limitation, d&apos;opposition et de portabilité de vos données.
          Vous pouvez les exercer à tout moment en écrivant à{" "}
          <a href="mailto:contact.fluidea@gmail.com" className={legalLinkClass}>
            contact.fluidea@gmail.com
          </a>
          .
        </p>
        <p>
          Vous avez également le droit d&apos;introduire une réclamation auprès de la CNIL (
          <a
            href="https://www.cnil.fr"
            target="_blank"
            rel="noopener noreferrer"
            className={legalLinkClass}
          >
            www.cnil.fr
          </a>
          ).
        </p>
      </LegalSection>

      <LegalSection title="Cookies">
        <p>
          Le Site limite les cookies au strict nécessaire à son fonctionnement. Des cookies ou
          traceurs peuvent être déposés par les services tiers intégrés (par exemple le widget
          de prise de rendez-vous Calendly). Vous pouvez configurer votre navigateur pour les
          refuser.
        </p>
      </LegalSection>

      <LegalSection title="Sécurité">
        <p>
          Fluidea met en œuvre des mesures techniques et organisationnelles appropriées pour
          protéger vos données contre tout accès, altération ou divulgation non autorisés.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          Pour toute question sur cette politique ou sur le traitement de vos données :{" "}
          <a href="mailto:contact.fluidea@gmail.com" className={legalLinkClass}>
            contact.fluidea@gmail.com
          </a>
          . Voir aussi nos{" "}
          <Link href="/mentions-legales" className={legalLinkClass}>
            Mentions légales
          </Link>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
