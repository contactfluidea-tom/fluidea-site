import type { IconType } from "react-icons";
import {
  LuChartColumn,
  LuClock,
  LuFileText,
  LuHandshake,
  LuMailCheck,
  LuMegaphone,
  LuMessagesSquare,
  LuTarget,
  LuWorkflow,
} from "react-icons/lu";

/**
 * Un cas d'automatisation présenté dans le carrousel « Réalisations ».
 *
 * Structure volontairement simple et éditable : pour publier un vrai projet,
 * dupliquez une entrée de `WORK_CASES` et remplacez les quatre champs de
 * contenu (`title`, `problem`, `solution`, `result`) + les étapes du diagramme
 * (`nodes`). Aucun visuel à produire : le schéma de workflow est généré à partir
 * de `nodes`.
 */
export interface WorkCase {
  /** Identifiant court (clé React). */
  key: string;
  /** Catégorie courte affichée en étiquette. */
  category: string;
  /** Titre du cas. */
  title: string;
  /** Le problème de départ du client. */
  problem: string;
  /** La solution mise en place. */
  solution: string;
  /** Le résultat obtenu — chiffré et mis en avant (ex. « -80 % de temps »). */
  result: string;
  /**
   * Étapes du flux d'automatisation, dans l'ordre. Alimente le diagramme de
   * workflow (`WorkflowDiagram`) : 3 à 5 libellés courts donnent le meilleur
   * rendu.
   */
  nodes: string[];
  /** Icône illustrant le cas (affichée près du titre). */
  icon: IconType;
}

/**
 * Cas d'usage d'exemple. À remplacer / compléter par de vrais projets clients
 * au fil du temps — il suffit d'éditer les champs ci-dessous.
 */
export const WORK_CASES: WorkCase[] = [
  {
    key: "prospection",
    category: "Prospection & ventes",
    title: "Prospection B2B automatisée",
    problem:
      "Trouver des prospects qualifiés demande des heures de recherche manuelle, et les relances passent souvent à la trappe.",
    solution:
      "Le système détecte les bons prospects, enrichit leurs données et envoie des messages personnalisés au bon moment, en continu.",
    result: "×3 de rendez-vous qualifiés",
    nodes: ["Veille", "Scoring IA", "Message", "CRM"],
    icon: LuTarget,
  },
  {
    key: "devis",
    category: "Administratif",
    title: "Génération de devis instantanée",
    problem:
      "Chaque devis oblige à ressaisir les mêmes informations, calculer les tarifs à la main et y revenir plusieurs fois.",
    solution:
      "À partir d'une simple demande, le besoin est qualifié, le tarif calculé et le devis généré, prêt à envoyer et synchronisé au CRM.",
    result: "Un devis en 2 min au lieu de 45",
    nodes: ["Demande", "Qualification", "Tarif", "Devis PDF"],
    icon: LuFileText,
  },
  {
    key: "support",
    category: "Support client",
    title: "Support client IA 24/7",
    problem:
      "Les mêmes questions reviennent en boucle et saturent votre équipe, jour et nuit.",
    solution:
      "Un agent IA répond instantanément aux demandes courantes et n'escalade que les cas complexes, avec tout le contexte utile.",
    result: "-80 % de tickets traités à la main",
    nodes: ["Message", "Agent IA", "Réponse", "Escalade"],
    icon: LuMessagesSquare,
  },
  {
    key: "reporting",
    category: "Pilotage & data",
    title: "Reporting automatisé",
    problem:
      "Compiler chaque semaine les chiffres de tous vos outils est long, fastidieux et source d'erreurs.",
    solution:
      "Les données sont collectées, consolidées puis résumées en un rapport clair, livré automatiquement dans votre boîte mail.",
    result: "-6 h de reporting par semaine",
    nodes: ["Sources", "Consolidation", "Synthèse IA", "Rapport"],
    icon: LuChartColumn,
  },
  {
    key: "emails",
    category: "Productivité",
    title: "Tri & réponse des e-mails",
    problem:
      "Votre boîte de réception déborde et trier l'urgent du secondaire grignote votre journée.",
    solution:
      "Chaque e-mail est classé, priorisé et pré-rédigé selon votre ton : il ne reste plus qu'à relire et valider.",
    result: "Boîte de réception à zéro, chaque jour",
    nodes: ["E-mail", "Tri IA", "Brouillon", "Validation"],
    icon: LuMailCheck,
  },
  {
    key: "contenu",
    category: "Marketing & contenu",
    title: "Contenu multi-réseaux en pilote auto",
    problem:
      "Décliner et publier du contenu sur chaque réseau, puis suivre les performances, prend un temps fou.",
    solution:
      "À partir d'une seule idée, le contenu est décliné, programmé et publié partout, et les performances remontent toutes seules.",
    result: "×10 de contenus publiés",
    nodes: ["Idée", "Déclinaison IA", "Programmation", "Stats"],
    icon: LuMegaphone,
  },
];

/** Une statistique d'impact, cible d'un compteur animé au scroll. */
export interface WorkStat {
  /** Identifiant court (clé React). */
  key: string;
  /** Valeur cible du compteur. */
  value: number;
  /** Préfixe éventuel devant le chiffre (ex. « ≈ »). */
  prefix?: string;
  /** Suffixe éventuel après le chiffre (ex. « + »). */
  suffix?: string;
  /** Libellé affiché sous le chiffre. */
  label: string;
  /** Icône d'accompagnement. */
  icon: IconType;
}

/**
 * Chiffres d'impact cumulés (compteurs animés). Valeurs d'exemple à ajuster
 * avec vos vrais résultats — modifier `value`/`suffix` suffit.
 */
export const WORK_STATS: WorkStat[] = [
  {
    key: "hours",
    value: 1200,
    suffix: "+",
    label: "heures économisées",
    icon: LuClock,
  },
  {
    key: "automations",
    value: 80,
    suffix: "+",
    label: "automatisations livrées",
    icon: LuWorkflow,
  },
  {
    key: "clients",
    value: 30,
    suffix: "+",
    label: "clients accompagnés",
    icon: LuHandshake,
  },
];
