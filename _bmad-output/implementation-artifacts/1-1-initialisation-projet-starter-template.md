# Story 1.1 : Initialisation du projet avec starter template

Status: review

## Story

As a développeur,
I want un projet Next.js 16 initialisé avec le starter Supabase, shadcn/ui, la structure feature-based, et les design tokens Rentic,
So that toute l'équipe dispose d'une base de code fonctionnelle et cohérente pour développer.

## Acceptance Criteria

1. **Given** aucun projet n'existe **When** le starter template est exécuté et configuré **Then** le projet Next.js 16 démarre sans erreur avec `npm run dev`
2. **And** shadcn/ui est initialisé avec les design tokens Rentic (palette indigo #5B6CF0, amber #F59E0B, fond lavande #F8F7FF, radius 16px)
3. **And** la font Bricolage Grotesque (variable, 200-800) est configurée
4. **And** la structure `features/` avec tests co-localisés est en place
5. **And** le pattern `ActionResult<T>` est défini dans `lib/types/`
6. **And** les fichiers de convention (eslint, prettier, tsconfig) sont configurés
7. **And** Sentry est intégré avec capture automatique des erreurs

## Tasks / Subtasks

- [x] **Task 1 : Scaffolding du projet** (AC: #1)
  - [x] 1.1 Exécuter `npx create-next-app -e with-supabase rentic`
  - [x] 1.2 Vérifier que le projet démarre avec `npm run dev` sur localhost:3000
  - [x] 1.3 Mettre à jour `package.json` si besoin pour cibler Next.js 16.1.x
  - [x] 1.4 Vérifier que Turbopack est actif par défaut (dev + build)
  - [x] 1.5 Créer le fichier `.env.example` avec toutes les variables requises
  - [x] 1.6 Configurer `.env.local` à partir du template (gitignored)

- [x] **Task 2 : Design tokens et shadcn/ui** (AC: #2)
  - [x] 2.1 Le starter inclut déjà shadcn/ui — reconfigurer avec les tokens Rentic
  - [x] 2.2 Éditer `src/app/globals.css` avec les CSS variables Direction 3 "Soft Rounded"
  - [x] 2.3 Éditer `tailwind.config.ts` pour mapper les tokens custom (couleurs, radius, shadows)
  - [x] 2.4 Éditer `components.json` avec le style Rentic (radius, etc.)
  - [x] 2.5 Installer les composants shadcn/ui essentiels : Button, Input, Card, Form, Sonner, Dialog, Sheet, Skeleton, Badge, Table, Tabs, Select, Calendar, Separator, Alert, Tooltip, Avatar, Breadcrumb

- [x] **Task 3 : Font Bricolage Grotesque** (AC: #3)
  - [x] 3.1 Configurer la font via `next/font/google` avec weight range 200-800
  - [x] 3.2 Appliquer en `className` sur `<html>` dans `src/app/layout.tsx`
  - [x] 3.3 Mettre à jour `tailwind.config.ts` pour utiliser Bricolage Grotesque comme font par défaut
  - [x] 3.4 Ajouter `<html lang="fr">` dans le root layout
  - [x] 3.5 Configurer `font-variant-numeric: tabular-nums` en utility class

- [x] **Task 4 : Structure feature-based** (AC: #4)
  - [x] 4.1 Créer l'arborescence `src/features/` avec les dossiers vides pour chaque feature
  - [x] 4.2 Ajouter un fichier `.gitkeep` dans chaque dossier feature vide
  - [x] 4.3 Créer la structure `src/app/` avec les route groups
  - [x] 4.4 Créer `src/components/ui/` (déjà par shadcn) et `src/components/shared/`
  - [x] 4.5 Créer `src/lib/supabase/` avec fichiers existants du starter + `admin.ts`
  - [x] 4.6 Créer `src/lib/utils/` avec `cn.ts`, `query-keys.ts`, `format-date.ts`, `format-currency.ts`
  - [x] 4.7 Créer `src/config/` avec `site.ts`, `navigation.ts`, `plans.ts`
  - [x] 4.8 Créer `src/lib/stripe/` et `src/lib/email/` (vides)
  - [x] 4.9 Créer `e2e/` et `e2e/fixtures/` (vides)

- [x] **Task 5 : Pattern ActionResult\<T\>** (AC: #5)
  - [x] 5.1 Créer `src/types/global.ts` avec la définition du type `ActionResult<T>`
  - [x] 5.2 Créer `src/types/database.ts` (placeholder pour les types générés par Supabase CLI)

- [x] **Task 6 : Conventions (ESLint, Prettier, TSConfig)** (AC: #6)
  - [x] 6.1 Vérifier que `tsconfig.json` est en mode `strict: true`
  - [x] 6.2 Ajouter les path aliases dans tsconfig : `@/*` → `src/*`
  - [x] 6.3 Configurer ESLint avec les règles Next.js recommended + no-any
  - [x] 6.4 Configurer Prettier (semi, singleQuote, trailingComma, printWidth)
  - [x] 6.5 Ajouter les scripts npm : `lint`, `format`, `type-check`
  - [x] 6.6 Configurer Vitest (`vitest.config.ts`) avec alias et couverture
  - [x] 6.7 Configurer Playwright (`playwright.config.ts`) minimal

- [x] **Task 7 : Intégration Sentry** (AC: #7)
  - [x] 7.1 Installer `@sentry/nextjs` et créer manuellement les fichiers de config
  - [x] 7.2 Fichiers créés : `instrumentation-client.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`
  - [x] 7.3 Ajouter `SENTRY_DSN` et `NEXT_PUBLIC_SENTRY_DSN` dans `.env.example`
  - [x] 7.4 Configurer l'enrichissement de contexte Sentry (pattern pour shop_id + userId)
  - [x] 7.5 Ajouter `src/app/error.tsx` (global error boundary) et `src/app/not-found.tsx`

- [x] **Task 8 : Validation finale**
  - [x] 8.1 `npm run dev` démarre sans erreur (Next.js 16.1.7, Turbopack, 529ms)
  - [x] 8.2 `npm run build` réussit sans erreur (2.0s compilation)
  - [x] 8.3 `npm run lint` passe sans erreur
  - [x] 8.4 `npm run type-check` passe sans erreur
  - [x] 8.5 La page d'accueil s'affiche avec la font Bricolage Grotesque et le fond lavande #F8F7FF
  - [x] 8.6 Le commit initial est créé avec tout le code (7c8934b)

## Dev Notes

### Stack technique exacte

| Technologie | Version | Commande d'installation |
|---|---|---|
| Next.js | 16.1.x (latest stable : 16.1.6) | Via starter template |
| React | 19.2 (inclus avec Next.js 16.1) | Via starter template |
| TypeScript | strict mode | Via starter template |
| Supabase JS | v2.98+ (`@supabase/supabase-js`) | Via starter template |
| `@supabase/ssr` | latest | Via starter template |
| shadcn/ui | CLI v4 (mars 2026) | Via starter template (pré-initialisé) |
| Tailwind CSS | v4 | Via starter template |
| Vitest | latest | `npm install -D vitest @vitejs/plugin-react` |
| Playwright | latest | `npm install -D @playwright/test` |
| Sentry | @sentry/nextjs 10.41.0 | `npx @sentry/wizard@latest -i nextjs` |

### Variables d'environnement (.env.example)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Sentry
SENTRY_DSN=your_sentry_dsn
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn

# Stripe (à configurer dans Epic 6)
# STRIPE_SECRET_KEY=
# STRIPE_WEBHOOK_SECRET_SUBSCRIPTIONS=
# STRIPE_WEBHOOK_SECRET_CONNECT=
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Resend (à configurer dans Epic 6)
# RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
REVALIDATION_SECRET=your_revalidation_secret
```

**Note importante :** Supabase a renommé `NEXT_PUBLIC_SUPABASE_ANON_KEY` en `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Les deux fonctionnent pendant la transition. Le starter utilise le nouveau nom.

### Design tokens complets — Direction 3 "Soft Rounded"

**globals.css — CSS Variables à configurer :**

```css
:root {
  /* Couleurs primaires */
  --primary: 231 78% 65%;          /* #5B6CF0 - bleu indigo */
  --primary-foreground: 0 0% 100%; /* #FFFFFF */

  /* Couleurs secondaires */
  --secondary: 231 78% 96%;        /* bleu très léger */
  --secondary-foreground: 231 30% 30%;

  /* Accent */
  --accent-color: 38 92% 63%;      /* #F59E0B - amber */

  /* Sémantiques */
  --success: 142 71% 45%;          /* #22C55E */
  --warning: 48 96% 47%;           /* #EAB308 */
  --destructive: 0 84% 60%;        /* #EF4444 */

  /* Surfaces */
  --background: 250 100% 99%;      /* #F8F7FF - lavande */
  --card: 0 0% 100%;               /* #FFFFFF */
  --sidebar-background: 0 0% 100%; /* #FFFFFF */
  --nav-active: 233 100% 96%;      /* #EEF0FF */
  --toggle-bg: 248 17% 93%;        /* #EEEDF5 */
  --toggle-active: 0 0% 100%;      /* #FFFFFF */

  /* Border Radius - Direction 3 */
  --radius-sm: 0.5rem;    /* 8px - inputs, badges */
  --radius-md: 0.75rem;   /* 12px - buttons, nav items */
  --radius-lg: 1rem;      /* 16px - cards, modals */
  --radius-xl: 1.25rem;   /* 20px - large containers */
  --radius: 1rem;         /* shadcn default → 16px */

  /* Shadows - Direction 3 */
  --shadow-sm: 0 1px 4px rgba(0,0,0,0.03);
  --shadow-md: 0 2px 12px rgba(0,0,0,0.04);
  --shadow-lg: 0 4px 16px rgba(0,0,0,0.08);
  --shadow-hover: 0 4px 16px rgba(0,0,0,0.08);
}
```

### Typographie — Bricolage Grotesque

```typescript
// src/app/layout.tsx
import { Bricolage_Grotesque } from 'next/font/google'

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800'],
  variable: '--font-bricolage',
  display: 'swap',
})

// Dans le JSX :
<html lang="fr" className={bricolage.variable}>
```

**Échelle typographique :**

| Token | Taille | Weight | Usage |
|---|---|---|---|
| display | 36px / 2.25rem | 700 | Hero landing, titres marketing |
| h1 | 28px / 1.75rem | 700 | Titres de page dashboard |
| h2 | 22px / 1.375rem | 600 | Titres de section |
| h3 | 18px / 1.125rem | 600 | Sous-titres, titres de carte |
| body | 16px / 1rem | 400 | Texte principal |
| body-sm | 14px / 0.875rem | 400 | Texte secondaire, labels |
| caption | 12px / 0.75rem | 400 | Aide, timestamps, badges |

### Pattern ActionResult\<T\>

```typescript
// src/types/global.ts
export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> }
```

**Règle absolue :** Toutes les Server Actions retournent `ActionResult<T>`. Jamais de `throw`.

### Structure de répertoire complète attendue

```
rentic/
├── .env.example
├── .env.local                    (gitignored)
├── .github/workflows/            (CI — peut être vide pour l'instant)
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── components.json
├── vitest.config.ts
├── playwright.config.ts
├── instrumentation-client.ts     (Sentry)
├── sentry.server.config.ts       (Sentry)
├── sentry.edge.config.ts         (Sentry)
├── middleware.ts                  (Supabase Auth)
├── supabase/
│   ├── config.toml
│   └── migrations/               (vide — Story 1.2)
├── public/
│   └── favicon.ico
├── e2e/
│   └── fixtures/
└── src/
    ├── app/
    │   ├── globals.css            (tokens Rentic)
    │   ├── layout.tsx             (Bricolage Grotesque, lang="fr")
    │   ├── page.tsx
    │   ├── error.tsx              (global error boundary)
    │   ├── not-found.tsx
    │   ├── (auth)/
    │   ├── (dashboard)/
    │   ├── s/[shopSlug]/
    │   └── api/
    ├── features/
    │   ├── auth/
    │   ├── catalog/
    │   ├── reservations/
    │   ├── packs/
    │   ├── payments/
    │   ├── website-builder/
    │   ├── dashboard/
    │   ├── invoicing/
    │   ├── employees/
    │   ├── subscriptions/
    │   ├── tunnel/
    │   └── onboarding/
    ├── components/
    │   ├── ui/                    (shadcn/ui)
    │   └── shared/
    ├── lib/
    │   ├── supabase/
    │   │   ├── server.ts
    │   │   ├── client.ts
    │   │   ├── admin.ts
    │   │   └── middleware.ts
    │   ├── stripe/                (vide)
    │   ├── email/                 (vide)
    │   └── utils/
    │       ├── cn.ts
    │       ├── query-keys.ts
    │       ├── format-date.ts
    │       └── format-currency.ts
    ├── types/
    │   ├── global.ts              (ActionResult<T>)
    │   └── database.ts            (placeholder)
    └── config/
        ├── site.ts
        ├── navigation.ts
        └── plans.ts
```

### Conventions de nommage à respecter

| Élément | Convention | Exemple |
|---|---|---|
| Fichiers composants | kebab-case | `reservation-card.tsx` |
| Fichiers utilitaires | kebab-case | `format-date.ts` |
| Composants React | PascalCase | `ReservationCard` |
| Fonctions / hooks | camelCase | `useReservations()` |
| Server Actions | `{verb}{Noun}Action` | `createReservationAction` |
| Types | PascalCase | `Reservation`, `ActionResult` |
| Constantes | SCREAMING_SNAKE_CASE | `MAX_PARTICIPANTS` |
| Tables DB | snake_case, pluriel | `reservations` |
| Colonnes DB | snake_case | `shop_id` |

### Règles de frontière feature (CRITIQUE)

- Une feature peut importer depuis : `lib/`, `components/`, `types/`, `config/`
- Une feature ne peut **JAMAIS** importer depuis une autre feature
- Les composants spécifiques à une feature vont dans `features/{feature}/components/`
- Jamais de `any` en TypeScript
- Jamais de requêtes Supabase directement depuis un composant — toujours via `queries.ts` ou `actions.ts`

### Breakpoints responsive (Tailwind défauts)

| Token | Valeur | Contexte |
|---|---|---|
| sm | 640px | Mobile large |
| md | 768px | Tablette portrait |
| lg | 1024px | Tablette paysage / petit desktop |
| xl | 1280px | Desktop standard |
| 2xl | 1536px | Grand écran |

### Accessibilité (WCAG 2.1 AA dès le départ)

- Focus visible : ring bleu 2px, offset 2px
- Touch targets : minimum 44x44px
- Font minimum : 14px pour texte lisible
- `<html lang="fr">` pour les lecteurs d'écran
- HTML sémantique (`<nav>`, `<main>`, `<aside>`, `<header>`, `<section>`)

### Mises à jour tech critiques (mars 2026)

1. **Next.js 16.1.6** — Turbopack stable par défaut (dev + build). React Compiler stable. `cacheLife` et `cacheTag` stables (plus de préfixe `unstable_`). Accès synchrone aux APIs dynamiques supprimé — tout est async.
2. **Supabase starter** — shadcn/ui pré-initialisé. Nouveau nom de variable : `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (rétrocompatible avec `ANON_KEY`).
3. **shadcn/ui CLI v4** — `shadcn init` scaffolde des templates complets. Dark mode inclus pour Next.js. Flags `--diff`, `--dry-run`, `--view`.
4. **Sentry 10.41.0** — Wizard crée `instrumentation-client.ts` (remplace `sentry.client.config.ts`), `sentry.server.config.ts`, `sentry.edge.config.ts`.

### Project Structure Notes

- La structure est alignée avec l'architecture document [Source: _bmad-output/planning-artifacts/architecture.md#Section 6 — Source tree]
- Les design tokens suivent exactement la Direction 3 "Soft Rounded" [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Direction 3]
- Le starter Supabase fournit déjà `middleware.ts`, `lib/supabase/server.ts`, `lib/supabase/client.ts` — les réorganiser dans `src/lib/supabase/` si nécessaire
- Le starter peut utiliser une structure `utils/supabase/` — à migrer vers `src/lib/supabase/` pour cohérence

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Section 4 — Technical Stack]
- [Source: _bmad-output/planning-artifacts/architecture.md#Section 5 — Naming Conventions]
- [Source: _bmad-output/planning-artifacts/architecture.md#Section 6 — Source tree]
- [Source: _bmad-output/planning-artifacts/architecture.md#Section 7 — Communication Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#Section 9 — Error Handling]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Step 3 — Design Tokens]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Step 5 — Typography]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Step 14 — Direction 3 Soft Rounded]
- [Source: _bmad-output/planning-artifacts/prd.md#NFR-PERF, NFR-SEC, NFR-SEO]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.1]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

- shadcn/ui components generated with Tailwind v4 syntax (shadow-xs, origin-(), size-(), has-focus:) — fixed manually for Tailwind v3 compatibility
- Sentry wizard requires interactive mode — configured manually instead
- .next build cache caused stale type errors after removing starter routes — fixed by deleting .next/
- ESLint was scanning .next/build output — fixed by adding ignores to flat config
- Toast component deprecated in shadcn v4 — replaced with Sonner

### Completion Notes List

- Project scaffolded with `npx create-next-app@16.1.7 -e with-supabase`
- Restructured from root-level to `src/` based architecture
- 21 shadcn/ui components installed and patched for Tailwind v3
- All Rentic design tokens (Direction 3 "Soft Rounded") applied
- Bricolage Grotesque font configured with `next/font/google`
- Feature-based directory structure with 12 feature modules
- Route groups: (auth), (dashboard), s/[shopSlug], api
- ActionResult<T> type defined
- Sentry integrated with error boundary and not-found pages
- ESLint, Prettier, Vitest, Playwright configured
- All validation checks pass: dev, build, lint, type-check

### File List

- .env.example (modified)
- .env.local (new, gitignored)
- .gitignore (from starter)
- .prettierrc (new)
- components.json (modified — src/ paths)
- eslint.config.mjs (modified — no-any rule, ignores)
- instrumentation-client.ts (new — Sentry client)
- next.config.ts (modified — Sentry wrapper, turbopack root)
- package.json (modified — scripts, dependencies)
- playwright.config.ts (new)
- postcss.config.mjs (from starter)
- sentry.edge.config.ts (new)
- sentry.server.config.ts (new)
- tailwind.config.ts (modified — Rentic tokens, font, custom shadows/radius)
- tsconfig.json (modified — @/* → src/*)
- vitest.config.ts (new)
- e2e/.gitkeep (new)
- e2e/fixtures/.gitkeep (new)
- src/app/error.tsx (new — global error boundary)
- src/app/globals.css (modified — Rentic design tokens)
- src/app/layout.tsx (modified — Bricolage Grotesque, lang="fr", metadata)
- src/app/not-found.tsx (new)
- src/app/page.tsx (modified — Rentic landing)
- src/components/auth-button.tsx (from starter)
- src/components/login-form.tsx (from starter)
- src/components/sign-up-form.tsx (from starter)
- src/components/forgot-password-form.tsx (from starter)
- src/components/update-password-form.tsx (from starter)
- src/components/logout-button.tsx (from starter)
- src/components/shared/ (new, empty)
- src/components/ui/*.tsx (21 components — shadcn/ui, patched for TW v3)
- src/config/site.ts (new)
- src/config/navigation.ts (new, placeholder)
- src/config/plans.ts (new, placeholder)
- src/features/{auth,catalog,reservations,packs,payments,website-builder,dashboard,invoicing,employees,subscriptions,tunnel,onboarding}/.gitkeep (new)
- src/lib/email/.gitkeep (new)
- src/lib/stripe/.gitkeep (new)
- src/lib/supabase/admin.ts (new, placeholder)
- src/lib/supabase/client.ts (from starter)
- src/lib/supabase/server.ts (from starter)
- src/lib/utils.ts (modified — removed tutorial code)
- src/lib/utils/format-currency.ts (new, placeholder)
- src/lib/utils/format-date.ts (new, placeholder)
- src/lib/utils/query-keys.ts (new, placeholder)
- src/types/database.ts (new, placeholder)
- src/types/global.ts (new — ActionResult<T>)
