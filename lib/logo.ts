/**
 * Emblème « F » circuit de Fluidea — source unique en SVG inline.
 *
 * Réutilisé par l'image Open Graph générée via `next/og` (`app/opengraph-image.tsx`).
 * Les favicons/icônes app sont désormais des fichiers statiques générés par
 * `scripts/generate-icons.mjs` (`app/icon.svg|png`, `app/favicon.ico`,
 * `app/apple-icon.png`, `public/icon-192|512.png`). Ce module fournit la même
 * géométrie sous forme de chaîne pour les images générées à la volée.
 *
 * Dégradé de marque (vertical) : #FFB347 → #FF9A3D → #FF6B2C.
 */

/** Emblème en dégradé orange, fond transparent (pour fonds sombres). */
export const EMBLEM_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="5.5 3.5 201.1 245.0" fill="none"><defs><linearGradient id="e" x1="0" y1="9.5" x2="0" y2="242.5" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FFB347"/><stop offset="0.45" stop-color="#FF9A3D"/><stop offset="1" stop-color="#FF6B2C"/></linearGradient></defs><g stroke="url(#e)" stroke-width="13" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M 18 236 L 18 29 Q 18 16 31 16 L 192 16"/><path d="M 44 236 L 44 55 Q 44 42 57 42 L 180 42"/><path d="M 70 236 L 70 81 Q 70 68 83 68 L 160 68"/><path d="M 70 119 Q 70 106 83 106 L 154 106"/><path d="M 70 145 Q 70 132 83 132 L 134 132"/><path d="M 18 214 Q 18 236 31 236 Q 44 236 44 214"/></g><g fill="url(#e)"><circle cx="192" cy="16" r="8.6"/><circle cx="180" cy="42" r="8.6"/><circle cx="160" cy="68" r="8.6"/><circle cx="154" cy="106" r="8.6"/><circle cx="134" cy="132" r="8.6"/><circle cx="31" cy="236" r="8.6"/><circle cx="44" cy="92" r="8.6"/></g></svg>`;

/** Emblème en sombre uni (#0A0A0F), fond transparent — pour pose sur un carré orange. */
export const EMBLEM_SVG_DARK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="5.5 3.5 201.1 245.0" fill="none"><g stroke="#0A0A0F" stroke-width="13" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M 18 236 L 18 29 Q 18 16 31 16 L 192 16"/><path d="M 44 236 L 44 55 Q 44 42 57 42 L 180 42"/><path d="M 70 236 L 70 81 Q 70 68 83 68 L 160 68"/><path d="M 70 119 Q 70 106 83 106 L 154 106"/><path d="M 70 145 Q 70 132 83 132 L 134 132"/><path d="M 18 214 Q 18 236 31 236 Q 44 236 44 214"/></g><g fill="#0A0A0F"><circle cx="192" cy="16" r="8.6"/><circle cx="180" cy="42" r="8.6"/><circle cx="160" cy="68" r="8.6"/><circle cx="154" cy="106" r="8.6"/><circle cx="134" cy="132" r="8.6"/><circle cx="31" cy="236" r="8.6"/><circle cx="44" cy="92" r="8.6"/></g></svg>`;

/** Ratio largeur/hauteur de l'emblème (pour le dimensionnement). */
export const EMBLEM_RATIO = 0.8116;

/** Encode un SVG en data-URI utilisable dans `<img src>` (y compris sous Satori/next-og). */
export function svgToDataUri(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
