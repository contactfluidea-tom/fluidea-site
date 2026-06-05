/**
 * Un témoignage client affiché dans le carrousel « Ils me font confiance ».
 *
 * La structure est volontairement extensible : pour publier un vrai avis, il
 * suffit d'ajouter une entrée dans `TESTIMONIALS`. Le champ `avatar` est
 * optionnel et dégrade proprement — tant qu'aucune photo n'est fournie, un
 * avatar de remplacement (initiales sur dégradé de marque) est généré.
 */
export interface Testimonial {
  /** Identifiant court (clé React). */
  key: string;
  /** Nom de la personne. */
  name: string;
  /** Rôle + entreprise (ex. « Fondatrice, Atelier Lumen »). */
  role: string;
  /** Citation orientée résultats d'automatisation. */
  quote: string;
  /** Note sur 5 (étoiles). Défaut : 5. Les demi-notes (ex. 4.5) sont gérées. */
  rating?: number;
  /**
   * Chemin d'une photo réelle (dans `/public`). Absent pour l'instant : un
   * avatar de remplacement à initiales est alors affiché.
   */
  avatar?: string;
}

/**
 * Avis d'exemple (entrepreneurs, freelances et dirigeants de PME). À remplacer
 * par de vrais témoignages clients au fil du temps — voir `Testimonial` pour le
 * champ `avatar`.
 */
export const TESTIMONIALS: Testimonial[] = [
  {
    key: "camille",
    name: "Camille Roussel",
    role: "Fondatrice, Atelier Lumen",
    quote:
      "Notre support tourne désormais 24/7 : Claude répond à 8 demandes sur 10 et n'escalade que les cas qui comptent vraiment. J'ai récupéré l'équivalent d'un mi-temps.",
    rating: 5,
  },
  {
    key: "julien",
    name: "Julien Mercier",
    role: "Dirigeant, Mercier & Associés",
    quote:
      "Devis, relances, factures : tout ce qui me prenait deux heures par jour se fait maintenant tout seul. Tom a saisi nos process en une seule réunion, et le système n'a jamais flanché depuis.",
    rating: 5,
  },
  {
    key: "sarah",
    name: "Sarah Benali",
    role: "Consultante marketing, freelance",
    quote:
      "À partir d'une seule idée, mon contenu part automatiquement sur cinq réseaux. J'ai doublé ma visibilité en trois mois — et récupéré mes soirées.",
    rating: 5,
  },
  {
    key: "thomas",
    name: "Thomas Lefèvre",
    role: "Co-fondateur, Nivo (SaaS)",
    quote:
      "Chaque lundi, notre reporting est généré et envoyé sans qu'on y touche. Fini les exports à la main : on décide enfin sur des données fiables, pas sur des tableaux à moitié faits.",
    rating: 5,
  },
  {
    key: "elodie",
    name: "Élodie Garnier",
    role: "Gérante, Studio Garnier",
    quote:
      "La prospection tourne en autonomie : détection, enrichissement, messages personnalisés. On a triplé nos rendez-vous qualifiés sans recruter un seul commercial.",
    rating: 5,
  },
  {
    key: "karim",
    name: "Karim Haddad",
    role: "Gérant, KH Chauffage",
    quote:
      "Les demandes de devis sont qualifiées et reçoivent une réponse en deux minutes, même quand je suis sur un chantier. Je ne perds plus un client par manque de réactivité.",
    rating: 5,
  },
];
