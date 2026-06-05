# Déploiement de Fluidea sur Vercel — domaine `fluidea.pro`

Guide pas-à-pas pour mettre le site en ligne. Il suppose que tu possèdes **déjà** un
compte **GitHub** et un compte **Vercel**, et que le domaine **fluidea.pro** est acheté
chez **Hostinger**.

Ordre conseillé : **A → B → C → D**, puis la **checklist E**.

---

## A. Pousser le code sur GitHub (compte existant)

Le projet est déjà un dépôt Git local avec un commit `Initial production-ready build`.

1. Sur GitHub, connecte-toi à ton compte → **New repository**.
   - Nom : `fluidea-site` (ou autre).
   - Visibilité : **Privé**.
   - **Ne coche rien** (pas de README, .gitignore ni licence : le dépôt local les a déjà).
2. Récupère l'URL du dépôt (onglet « …or push an existing repository »), puis dans le
   dossier du projet :

   ```bash
   git remote add origin https://github.com/<ton-utilisateur>/fluidea-site.git
   git branch -M main
   git push -u origin main
   ```

   > Si tu utilises SSH : `git remote add origin git@github.com:<ton-utilisateur>/fluidea-site.git`.

3. Vérifie sur GitHub que `.env.local` **n'apparaît pas** (il est ignoré par `.gitignore`).
   Seul `.env.example` doit être visible.

---

## B. Importer et déployer sur Vercel (compte existant)

1. Connecte-toi à ton compte **Vercel** → **Add New… → Project**.
2. **Import Git Repository** : choisis `fluidea-site`. Si Vercel demande l'accès,
   autorise-le sur ce dépôt (Install/Configure GitHub App).
3. **Framework Preset** : `Next.js` est détecté automatiquement. Laisse les réglages de
   build **par défaut** (Build `next build`, Output géré par Next, Install `npm install`).
4. **Environment Variables** — ajoute les mêmes clés que `.env.example` (onglet
   *Environment Variables*, scope *Production* + *Preview*) :

   | Clé | Valeur |
   |---|---|
   | `NEXT_PUBLIC_SITE_URL` | `https://fluidea.pro` |
   | `NEXT_PUBLIC_CALENDLY_URL` | `https://calendly.com/fluidea-appel/appel-decouverte` |
   | `NEXT_PUBLIC_FAQ_SPLINE_URL` | `https://prod.spline.design/XCkzCgkJK37ndXZz/scene.splinecode` |
   | `RESEND_API_KEY` | *(la vraie clé Resend, commence par `re_…`)* |

   Optionnel (recommandé une fois le domaine vérifié dans Resend — voir **D**) :

   | Clé | Valeur |
   |---|---|
   | `RESEND_FROM` | `Fluidea <contact@fluidea.pro>` |
   | `CONTACT_TO` | `contact.fluidea@gmail.com` |

5. **(UE / RGPD) Région des fonctions = Frankfurt (`fra1`).** Le code force déjà
   `preferredRegion = "fra1"` sur la route `/api/contact`. Tu peux aussi le confirmer dans
   **Project → Settings → Functions → Function Region → Frankfurt, Germany (fra1)**.
6. Clique **Deploy**. À la fin, tu obtiens une URL de preview `…vercel.app` : vérifie qu'elle
   s'ouvre correctement.

> Pour les déploiements suivants : chaque `git push` sur `main` redéploie automatiquement.

---

## C. Connecter le domaine `fluidea.pro` (DNS chez Hostinger)

> **Important :** on **garde la gestion DNS chez Hostinger** (on ne bascule **PAS** sur les
> nameservers de Vercel). Cela permet de conserver les enregistrements e-mail (Resend,
> MX, etc.) en place.

1. **Dans Vercel** → **Project → Settings → Domains** :
   - Ajoute `fluidea.pro`.
   - Ajoute `www.fluidea.pro`.
   - Définis **`fluidea.pro` comme domaine principal** (Primary) et configure la
     **redirection `www.fluidea.pro` → `fluidea.pro`** (Vercel le propose en un clic).
   - Vercel affiche alors les enregistrements DNS à créer.

2. **Dans Hostinger** → **hPanel → Domaines → fluidea.pro → Zone DNS / DNS Zone Editor**,
   ajoute exactement les enregistrements indiqués par Vercel (valeurs typiques) :

   | Type | Nom (Host) | Valeur (Points to) | TTL |
   |---|---|---|---|
   | `A` | `@` | `76.76.21.21` | 3600 (ou défaut) |
   | `CNAME` | `www` | `cname.vercel-dns.com` | 3600 (ou défaut) |

   - Si un enregistrement `A`/`CNAME` existant sur `@` ou `www` pointe ailleurs
     (parking Hostinger), **modifie-le / supprime-le** pour mettre les valeurs ci-dessus.
   - Respecte **les valeurs réellement affichées par Vercel** si elles diffèrent.

3. **Attends la propagation DNS** (quelques minutes à quelques heures). Dans Vercel, les
   domaines passent à **Valid Configuration**. Le **HTTPS / certificat SSL** est généré
   **automatiquement** par Vercel — rien à faire.

---

## D. Activer le formulaire de contact en production (Resend + `fluidea.pro`)

Le formulaire (`/api/contact`) envoie les e-mails via **Resend**. Pour envoyer depuis une
adresse `@fluidea.pro`, il faut vérifier le domaine dans Resend.

1. **Resend → Domains → Add Domain** : ajoute `fluidea.pro`.
2. Resend affiche des enregistrements **SPF**, **DKIM** et **return-path (MX/CNAME)**.
   Recopie-les **dans la Zone DNS Hostinger** (mêmes étapes qu'en **C.2**, types `TXT`,
   `MX` et/ou `CNAME` selon ce qu'indique Resend).
3. Attends que le domaine passe à **Verified** dans Resend.
4. Configure l'envoi :
   - Expéditeur : **`Fluidea <contact@fluidea.pro>`** → variable `RESEND_FROM` dans Vercel.
   - Destinataire : **`contact.fluidea@gmail.com`** → variable `CONTACT_TO` (déjà la valeur
     par défaut du code, mais mieux vaut l'expliciter).
5. Vérifie que **`RESEND_API_KEY`** est bien renseignée dans Vercel (étape **B.4**), puis
   **redéploie** (un nouveau `git push` ou *Redeploy* dans Vercel) pour prendre en compte les
   variables.

> Tant que le domaine n'est pas vérifié, garde l'expéditeur de test
> `Fluidea <onboarding@resend.dev>` (valeur par défaut) : les e-mails partent quand même
> vers `contact.fluidea@gmail.com`.

---

## E. Checklist de mise en ligne

- [ ] `https://fluidea.pro` s'ouvre en **HTTPS**, et `www.fluidea.pro` **redirige** vers l'apex.
- [ ] **Formulaire de contact** testé : un e-mail arrive bien sur `contact.fluidea@gmail.com`.
- [ ] **Widget Calendly** (appel découverte) s'affiche et fonctionne.
- [ ] **Toutes les routes OK** :
  - Accueil `/` et ses sections via ancres : `#services` *(→ Offres/Tarifs)*, `#process`,
    `#realisations`, `#a-propos`, `#contact`, `#reservation`.
  - Pages dédiées : `/faq`, `/mentions-legales`, `/politique-de-confidentialite`, `/cgv`.
  > Note : « Services » et « À propos » sont des **sections de l'accueil** (ancres), pas des
  > pages séparées. La page **`/cgv`** est un **modèle à compléter** (champs `[…]`).
- [ ] **Animations Spline** (Hero + FAQ) chargent correctement ; **fallback mobile** OK.
- [ ] **Responsive** : mobile (360 px), tablette (768 px), desktop — sans débordement.
- [ ] **Aperçu Open Graph** correct (image + titre) sur les réseaux
      (tester avec opengraph.xyz ou le validateur LinkedIn/X).
- [ ] **Favicon** présent (onglet + écran d'accueil iOS), **page 404** OK.
- [ ] **Lighthouse** : Performance / SEO / Accessibilité corrects.
- [ ] **`sitemap.xml`** (`https://fluidea.pro/sitemap.xml`) et **`robots.txt`**
      (`https://fluidea.pro/robots.txt`) accessibles et en URL absolues `fluidea.pro`.
- [ ] **Google Search Console** : ajouter la propriété `fluidea.pro` et **soumettre le sitemap**.

---

## Rappels utiles

- **Variables d'environnement** : la liste de référence est `.env.example`. Toute nouvelle
  clé doit être ajoutée **à la fois** dans `.env.example` (sans valeur secrète) **et** dans
  Vercel.
- **Ne jamais committer** `.env.local` ni de clé secrète (déjà couvert par `.gitignore`).
- **Build local** : `npm run build` doit passer sans erreur avant chaque mise en production.
- Les pages **légales** (`/mentions-legales`, `/politique-de-confidentialite`, `/cgv`) sont
  des **gabarits** : compléter les champs `[…]` et faire valider avant lancement commercial.
