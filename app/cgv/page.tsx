import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection, legalLinkClass } from "@/components/layout/LegalPage";

export const metadata: Metadata = {
  title: "Conditions générales de vente",
  description:
    "Conditions générales de vente (CGV) des prestations d'automatisation IA de Fluidea.",
  alternates: { canonical: "/cgv" },
};

/*
 * ⚠️ MODÈLE à compléter par Tom : renseigner les champs entre crochets [ ] et
 * faire valider par un professionnel. Ceci n'est pas un conseil juridique.
 */
export default function CgvPage() {
  return (
    <LegalPage
      title="Conditions générales de vente"
      intro="Les présentes conditions générales de vente (CGV) encadrent les prestations de services d'automatisation et d'intelligence artificielle proposées par Fluidea."
      updatedAt="juin 2026"
    >
      <LegalSection title="1. Objet et champ d'application">
        <p>
          Les présentes CGV régissent les relations contractuelles entre Fluidea (ci-après
          « le Prestataire ») et tout client professionnel (ci-après « le Client »)
          souhaitant bénéficier d&apos;une prestation : audit d&apos;automatisation,
          conception et mise en production de systèmes n8n + Claude, ou formation. Toute
          commande implique l&apos;acceptation sans réserve des présentes CGV.
        </p>
      </LegalSection>

      <LegalSection title="2. Prestations">
        <p>
          Le contenu et le périmètre de chaque prestation sont définis dans un devis ou une
          proposition commerciale remis au Client. Les prestations sont fournies à distance,
          sauf accord particulier. [Préciser ici les modalités propres à chaque offre.]
        </p>
      </LegalSection>

      <LegalSection title="3. Devis et commande">
        <p>
          Chaque prestation fait l&apos;objet d&apos;un devis personnalisé, valable [30] jours.
          La commande est ferme à réception du devis daté et signé (ou validé par voie
          électronique) et, le cas échéant, du versement de l&apos;acompte indiqué.
        </p>
      </LegalSection>

      <LegalSection title="4. Prix et modalités de paiement">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Les prix sont indiqués en euros, [hors taxes / TTC selon le statut].</li>
          <li>Acompte à la commande : [ex. 30 %] ; solde [à la livraison / selon échéancier].</li>
          <li>Moyens de paiement acceptés : [virement bancaire, …].</li>
          <li>
            Délai de paiement : [ex. 30 jours]. Tout retard entraîne des pénalités au taux
            [légal en vigueur] et une indemnité forfaitaire de recouvrement de 40 €.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Exécution et délais">
        <p>
          Les délais sont donnés à titre indicatif et courent à compter de la réception de
          l&apos;acompte et des éléments nécessaires fournis par le Client (accès, contenus,
          identifiants). Le Client s&apos;engage à collaborer activement et à fournir ces
          éléments en temps utile.
        </p>
      </LegalSection>

      <LegalSection title="6. Obligations du Client">
        <p>
          Le Client garantit disposer des droits et autorisations nécessaires sur les comptes,
          données et outils mis à disposition, et est seul responsable de la licéité des
          traitements qu&apos;il demande d&apos;automatiser.
        </p>
      </LegalSection>

      <LegalSection title="7. Droit de rétractation">
        <p>
          Les prestations s&apos;adressant à une clientèle professionnelle, le droit de
          rétractation prévu par le Code de la consommation ne s&apos;applique pas, sauf
          disposition contraire applicable aux professionnels employant moins de [cinq]
          salariés lorsque l&apos;objet du contrat n&apos;entre pas dans le champ de leur
          activité principale. [À adapter selon la cible.]
        </p>
      </LegalSection>

      <LegalSection title="8. Propriété intellectuelle">
        <p>
          Sauf stipulation contraire, les livrables sont cédés au Client après paiement
          intégral. Les briques, méthodes et savoir-faire génériques du Prestataire restent
          sa propriété. Le Prestataire peut citer la prestation à titre de référence, sauf
          opposition écrite du Client.
        </p>
      </LegalSection>

      <LegalSection title="9. Responsabilité">
        <p>
          Le Prestataire est tenu à une obligation de moyens. Sa responsabilité ne saurait
          être engagée pour les dysfonctionnements imputables à des services tiers (n8n,
          fournisseurs d&apos;IA, hébergeurs, API externes) ou à une mauvaise utilisation des
          livrables. En tout état de cause, la responsabilité du Prestataire est limitée au
          montant de la prestation concernée.
        </p>
      </LegalSection>

      <LegalSection title="10. Données personnelles">
        <p>
          Les traitements de données personnelles réalisés dans le cadre du site et des
          prestations sont décrits dans la{" "}
          <Link href="/politique-de-confidentialite" className={legalLinkClass}>
            Politique de confidentialité
          </Link>
          . Le cas échéant, un accord de sous-traitance (RGPD, art. 28) est conclu entre les
          parties.
        </p>
      </LegalSection>

      <LegalSection title="11. Droit applicable et litiges">
        <p>
          Les présentes CGV sont soumises au droit français. À défaut de résolution amiable,
          tout litige relève de la compétence des tribunaux de [ressort compétent]. Pour toute
          question :{" "}
          <a href="mailto:contact.fluidea@gmail.com" className={legalLinkClass}>
            contact.fluidea@gmail.com
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
