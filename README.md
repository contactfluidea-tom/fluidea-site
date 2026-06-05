# Fluidea — Site web

Base technique premium du site de **Fluidea** (automatisation IA sur-mesure).

**Stack :** Next.js 14 (App Router) · TypeScript · Tailwind CSS · Spline (3D) · GSAP + ScrollTrigger · Framer Motion · Lenis (smooth scroll).

## Démarrage

```bash
npm install      # installer les dépendances
npm run dev      # serveur de dev → http://localhost:3000
npm run build    # build de production
npm run start    # lancer le build de production
npm run lint     # linter ESLint
```

## Variables d'environnement

```bash
cp .env.example .env.local   # puis renseignez vos valeurs
```

Pour la mise en production sur Vercel + le domaine **fluidea.pro**, voir **`DEPLOYMENT.md`**.

## Arborescence

```
app/                 Routes, layout & styles globaux (App Router)
components/
  ui/                Composants d'interface réutilisables
  layout/            En-tête, pied de page, navigation
  sections/          Sections de page
  spline/            Wrappers des scènes 3D Spline
hooks/               Hooks React personnalisés
lib/                 Utilitaires (cn(), helpers)
public/assets/       Médias statiques
```

## Conventions

- **Polices :** Sora pour les titres (`font-sora`), Inter pour le corps (`font-sans`, par défaut).
- **Alias d'import :** `@/*` pointe vers la racine du projet (ex. `import { cn } from "@/lib/utils"`).
- **Images Spline :** le domaine `prod.spline.design` est autorisé dans `next.config.js`.
```
