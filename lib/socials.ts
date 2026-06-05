import type { IconType } from "react-icons";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTiktok } from "react-icons/fa6";

export interface Social {
  /** Identifiant court (clé React, ancrages…). */
  key: string;
  /** Nom affichable de la plateforme. */
  name: string;
  /** URL du profil / de la page. */
  href: string;
  /** Icône de marque (react-icons). */
  icon: IconType;
  /**
   * Nombre d'abonnés, cible du compteur animé. `null` quand le chiffre n'est
   * pas (encore) communiqué : on affiche alors un appel à l'action « Rejoindre »
   * plutôt que d'inventer une statistique. Renseigner ce champ suffit à activer
   * le compteur animé pour la plateforme.
   */
  followers: number | null;
  /** Affiche « ≈ » devant le chiffre (et « près de » pour les lecteurs d'écran). */
  approx?: boolean;
  /** Suffixe visible après le chiffre (ex. « + »). */
  suffix?: string;
  /** Libellé court affiché sous le chiffre. */
  label: string;
}

/**
 * Réseaux sociaux de Fluidea, centralisés ici pour être réutilisés partout
 * (preuve sociale, footer, page contact…).
 */
export const SOCIALS: Social[] = [
  {
    key: "facebook",
    name: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61579554252115",
    icon: FaFacebookF,
    followers: null,
    label: "sur Facebook",
  },
  {
    key: "tiktok",
    name: "TikTok",
    href: "https://www.tiktok.com/@tom.automatisation",
    icon: FaTiktok,
    followers: null,
    label: "sur TikTok",
  },
  {
    key: "instagram",
    name: "Instagram",
    href: "https://www.instagram.com/tom_automatisation/",
    icon: FaInstagram,
    followers: null,
    label: "sur Instagram",
  },
  {
    key: "linkedin",
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/tom-attinetti-ab0520225",
    icon: FaLinkedinIn,
    followers: null,
    label: "sur LinkedIn",
  },
];
