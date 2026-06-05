/**
 * Une question / réponse de la FAQ.
 *
 * `id` sert de clé React et de base aux identifiants ARIA (`aria-controls`,
 * `aria-labelledby`) de l'accordéon. Pour ajouter une question, il suffit
 * d'insérer une entrée dans `FAQ_ITEMS`.
 */
export interface FaqEntry {
  /** Identifiant court et stable (slug). */
  id: string;
  /** La question, telle qu'affichée dans l'en-tête de l'accordéon. */
  question: string;
  /** La réponse, révélée dans le panneau. Ton professionnel mais accessible. */
  answer: string;
}

/** Questions fréquentes sur l'automatisation IA (n8n + Claude). */
export const FAQ_ITEMS: FaqEntry[] = [
  {
    id: "petite-structure",
    question: "Est-ce adapté à une petite structure ?",
    answer:
      "Absolument — c'est même souvent là que l'impact est le plus fort. Quand on est seul·e ou en petite équipe, chaque heure compte. L'automatisation vous permet d'absorber plus de volume sans recruter et de vous concentrer sur ce qui a vraiment de la valeur. Les systèmes sont dimensionnés (et facturés) selon vos besoins réels, sans usine à gaz.",
  },
  {
    id: "delai",
    question: "Combien de temps pour mettre en place un système ?",
    answer:
      "Cela dépend de la complexité, mais un premier système utile est généralement livré en 1 à 3 semaines. On démarre par une automatisation à fort impact, rapidement mise en production, puis on étend progressivement. Vous voyez donc des résultats concrets très vite, sans projet interminable.",
  },
  {
    id: "tarif",
    question: "Combien coûte un système d'automatisation ?",
    answer:
      "Chaque système étant sur-mesure, le tarif dépend de votre besoin et de sa complexité — c'est pourquoi on fonctionne sur devis. La bonne nouvelle : l'appel découverte et l'audit initial sont offerts. Vous connaissez le périmètre et le budget avant de vous engager, sans surprise. La plupart des systèmes sont rentabilisés en quelques semaines grâce au temps gagné.",
  },
  {
    id: "appel-decouverte",
    question: "Comment se déroule l'appel découverte ?",
    answer:
      "C'est un échange de 30 minutes, gratuit et sans engagement. On fait le point sur votre activité, vos tâches chronophages et vos objectifs. On repère les automatisations les plus utiles pour vous, et vous repartez avec une vision claire des prochaines étapes — que l'on travaille ensemble ou non.",
  },
  {
    id: "competences",
    question: "Faut-il des compétences techniques de mon côté ?",
    answer:
      "Aucune. On s'occupe de toute la partie technique — conception, développement, mise en production. Vous recevez un système clé en main, accompagné d'une prise en main simple et claire. Et si vous souhaitez gagner en autonomie, c'est justement l'objet de la formation à venir.",
  },
  {
    id: "securite",
    question: "Mes données sont-elles sécurisées ?",
    answer:
      "Oui, la confidentialité est une priorité. Vos données transitent par vos propres outils et des connexions sécurisées ; rien n'est conservé inutilement. Les systèmes peuvent être hébergés sur votre infrastructure, et les accès sont limités au strict nécessaire. Vos informations sensibles restent sous votre contrôle.",
  },
  {
    id: "suivi",
    question: "Proposez-vous un suivi après la livraison ?",
    answer:
      "Oui. Un système n'est pas figé : vos besoins évoluent, vos outils aussi. On reste disponible pour ajuster, faire évoluer et maintenir vos automatisations. Vous gardez un interlocuteur unique, de l'audit au suivi, qui connaît votre système sur le bout des doigts.",
  },
];
