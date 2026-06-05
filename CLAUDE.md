# CLAUDE.md — Fluidea

Site vitrine business de **Fluidea** (automatisation IA sur-mesure : systèmes n8n + Claude pour entreprises). Esthétique **dark futuriste**, accent **orange**, animations soignées. Le site se construit section par section, piloté par les prompts de Tom.

> **Langue :** tout est en **français** — textes d'interface, commentaires, JSDoc, noms de sections. Conserver ce ton (professionnel mais accessible).

## Commandes

```bash
npm run dev          # serveur de dev → http://localhost:3000
npm run build        # build de production (validation finale)
npm run lint         # ESLint (next lint)
npx tsc --noEmit     # vérification de types (pas de script dédié)
```

**Avant de considérer une section terminée :** `npx tsc --noEmit` + `npm run lint` + `npm run build` doivent passer.

## Stack

Next.js 14 (App Router) · React 18 · TypeScript · Tailwind CSS 3 · GSAP + ScrollTrigger · Framer Motion · Lenis (smooth scroll) · React Three Fiber / Spline (3D du Hero) · `react-icons/lu` (Lucide). Alias d'import : `@/*` → racine du projet.

## Arborescence

```
app/
  layout.tsx         <html lang="fr">, polices next/font, SmoothScrollProvider + Navbar + Footer
  page.tsx           Assemble les sections dans l'ordre d'affichage
  globals.css        Tokens CSS, fond (body::before), classes utilitaires, bloc reduced-motion
  api/contact/       route handler du formulaire de contact (Resend via fetch ; repli log
                     si pas de clé ; bascule Web3Forms côté client en export statique)
  sitemap.ts robots.ts manifest.ts icon.tsx opengraph-image.tsx
                     SEO : Metadata API (layout = template + OG/Twitter + viewport themeColor ;
                     page = title/description/canonical), JSON-LD via lib/seo.ts
                     (ProfessionalService dans layout, FAQPage sur l'accueil), OG/icône
                     générées par next/og. URL réelle → NEXT_PUBLIC_SITE_URL
components/
  ui/                Design system réutilisable (barrel: ui/index.ts)
  layout/            Navbar, Footer, SmoothScrollProvider
  sections/          Une section = un fichier (Hero, Services, …)
  three/             AutomationScene (décor 3D du Hero)
hooks/               useReducedMotion, useMediaQuery
lib/                 utils (cn), données (work.ts, socials.ts, testimonials.ts, faq.ts), seo.ts
public/assets/       Médias statiques (logo.svg, tom.jpg, …)
```

## Avancement des sections (`app/page.tsx`)

Ordre actuel : `Hero → SocialProof → Services → Process → Work → About → Testimonials → Pricing → Faq → Booking → Contact`.

| Section | Fichier | Ancre |
|---|---|---|
| Hero | `Hero.tsx` | `#hero` |
| Preuve sociale | `SocialProof.tsx` | — |
| Services | `Services.tsx` | `#services` |
| Process / méthode | `Process.tsx` | `#process` |
| Réalisations | `Work.tsx` | `#realisations` |
| À propos | `About.tsx` | `#a-propos` |
| Témoignages | `Testimonials.tsx` | `#temoignages` |
| Offres / Tarifs | `Pricing.tsx` | `#tarifs` |
| FAQ | `Faq.tsx` | `#faq` |
| Réservation | `Booking.tsx` | `#reservation` |
| Contact | `Contact.tsx` | `#contact` |

**Toutes les sections, le footer et les pages légales sont en place.** Pages internes : `/mentions-legales` et `/politique-de-confidentialite` (coquille `components/layout/LegalPage.tsx` ; **contenu = modèles avec placeholders `[…]` à compléter/faire valider**). Navbar + Footer sont « cross-page » (`usePathname`) : hors accueil, le logo pointe vers `/` et les ancres vers `/#ancre`. Le scroll-spy de la Navbar ignore proprement les ancres dont la section n'existe pas encore.

## Design system & conventions

### Palette (Tailwind, cf. `tailwind.config.ts` + `globals.css`)
`bg #0A0A0F` · `surface #14141B` · `primary #FF6B2C` / `primary-soft #FF9A3D` · `glow #FFB347` · `text #F5F5F7` / `text-muted #A0A0AB`.
Ombres : `shadow-glow-sm|md|lg`. Dégradé : `bg-brand-gradient`.

### Polices
`font-display` = **Sora** (titres) · `font-sans` = **Inter** (corps, défaut). Échelle de titres fluide : `text-display-sm|md|lg|xl`.

### Classes utilitaires globales (`globals.css`, CSS pur → toujours dispo)
`.glass` (glassmorphism sombre) · `.text-gradient` (texte en dégradé orange) · `.glow-border` · `.btn-glow`.

### Composants UI (`components/ui/`) — à réutiliser systématiquement
- **`Section`** — espacement vertical + `scroll-mt` pour les ancres. `id` + `aria-label`. ⚠️ Pas de `forwardRef` : poser les `ref` GSAP sur des `div` internes.
- **`Container`** — largeur max + paddings responsives.
- **`SectionHeading`** — `eyebrow` (Badge) + `title` (via `AnimatedText`, dégradé + révélation mot à mot) + `subtitle`. Centré par défaut.
- **`Badge`**, **`Card`** (glass, `group` au hover), **`Button`**, **`AnimatedText`**.
- **`CalendlyEmbed`** — widget Calendly inline (section Réservation). Script chargé en asynchrone côté client (ne bloque pas le rendu), couleurs accordées à la marque via params d'URL, états chargement / prêt / échec (bouton de repli « Ouvrir le calendrier »). URL via **`NEXT_PUBLIC_CALENDLY_URL`** (cf. `.env.local.example`), défaut `https://calendly.com/fluidea-appel/appel-decouverte`.
- **`Button`** : polymorphe (`<button>` ou lien next/link si `href`). Variantes `primary|secondary|ghost`, tailles `sm|md|lg`, `leftIcon`/`rightIcon`, effet magnétique auto sur `primary` (désactivé si reduced-motion).

### Animations (pattern obligatoire)
- En-tête de fichier section : `"use client"` + `useIsomorphicLayoutEffect` (= `useLayoutEffect` client / `useEffect` SSR).
- **GSAP** dans `useIsomorphicLayoutEffect`, **toujours** sous `gsap.matchMedia()` + `mm.add("(prefers-reduced-motion: no-preference)", …)`, et `return () => mm.revert()`. Sans mouvement autorisé → contenu visible et statique.
- Révélation au scroll : `gsap.from(..., { opacity:0, y, ease:"power3.out", scrollTrigger:{ start:"top 8x%", once:true }})`, cascade via `stagger`.
- Hook **`useReducedMotion()`** côté React ; Framer Motion conditionne ses variants dessus.
- Le CSS global neutralise déjà toute animation/transition sous `prefers-reduced-motion: reduce`.

### Smooth scroll (Lenis)
`useLenis()` (contexte du `SmoothScrollProvider`). Pour un CTA vers une ancre, réutiliser le pattern :
```ts
lenis ? lenis.scrollTo(href, { offset: -80 })
      : el.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
```

### Données
Centralisées dans `lib/` quand réutilisées (`work.ts`, `socials.ts`) ; inline en tête de fichier sinon (`Services`, `Process`, `About`). Champs optionnels (`image`, `href`) qui « dégradent proprement » → privilégier ce style extensible (placeholders remplaçables sans refonte).

### Icônes
`react-icons/lu` (Lucide). **Vérifier l'existence** d'un nom avant usage (les exports varient) :
```bash
grep "export declare const LuXxx:" node_modules/react-icons/lu/index.d.ts
```

### Accessibilité (non négociable)
`prefers-reduced-motion` respecté partout · `Section` avec `aria-label` · anneau de focus visible (`focus-visible:ring-primary …`) · listes sémantiques (`<ul>`/`<ol>`) · éléments décoratifs `aria-hidden` · visuels chiffrés / icônes : libellé accessible (`aria-label`) avec contenu visuel `aria-hidden`.

### Images
Photos via **`next/image`** (`fill` + `sizes` pour les images qui remplissent un cadre, sinon `width`/`height`) : lazy par défaut, formats modernes **avif/webp** (`next.config.js` → `images.formats`), dimensions connues = pas de CLS. **Exception : le logo SVG reste en `<img>`** (next/image n'optimise pas le SVG ; garder le commentaire `// eslint-disable-next-line @next/next/no-img-element`). Médias servis depuis `public/`.
