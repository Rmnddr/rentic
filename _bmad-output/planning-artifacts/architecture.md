---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
status: 'complete'
completedAt: '2026-03-09'
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/prd-validation-report.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
  - _bmad-output/planning-artifacts/research/market-saas-location-saisonniere-research-2026-02-26.md
  - docs/bubble-app-analysis.md
  - docs/prd-v3.md
workflowType: 'architecture'
project_name: 'rentic'
user_name: 'Romain'
date: '2026-03-09'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**

47 FRs en 9 groupes couvrant le cycle complet : inscription → configuration catalogue → publication site web → réservation en ligne → paiement → gestion quotidienne. L'architecture doit supporter la boucle complète "loueur papier → business digital en 15 minutes".

Les FRs les plus structurants architecturalement :
- **FR7-FR8** : Catégories et attributs personnalisables — modèle de données semi-structuré
- **FR12** : Disponibilité stock < 5s — requêtes d'agrégation optimisées
- **FR16-FR18** : Tunnel de réservation avec disponibilité temps réel et packs configurables
- **FR23** : Prévention double-booking — contraintes de concurrence et transactions
- **FR25-FR30** : Website builder avec site public ISR — architecture de rendu hybride
- **FR31-FR33** : Double flux paiement (Stripe Connect + espèces) — 2 chemins de réconciliation
- **FR44-FR47** : Administration plateforme — monitoring cross-tenant

**Non-Functional Requirements:**

22 NFRs en 6 catégories. Les plus structurants :
- Performance : LCP < 2s (ISR/CDN), API p95 < 500ms (index PostgreSQL), 50 réservations simultanées par loueur
- Sécurité : RLS isolation, PCI-DSS délégué Stripe, RGPD, sessions 30min
- Scalabilité : 200 loueurs sans changement infra, 95% cache CDN, index jusqu'à 100K réservations
- Fiabilité : 99.9% uptime, 100% réconciliation paiements, webhooks idempotents, backups RPO < 24h
- SEO : Lighthouse > 90, indexation < 7 jours, rendu serveur + sitemap

**Scale & Complexity:**

- Domaine principal : Full-stack web (Next.js 15 + Supabase BaaS)
- Niveau de complexité : Moyenne-haute
- Composants architecturaux estimés : ~14

### Technical Constraints & Dependencies

| Contrainte | Source | Impact |
|------------|--------|--------|
| Stack Next.js 15 + Supabase + Stripe + Vercel | PRD (classification) | Architecture SSR/ISR, PostgreSQL + RLS, pas de backend custom |
| Brownfield (app Bubble existante) | PRD (classification) | Modèle de données de référence à mapper, patterns UX validés à conserver |
| ISR agressif pour coûts Vercel | PRD (risk mitigation) | Pages publiques 95% CDN, revalidation on-demand |
| Supabase Auth + RLS | PRD (multi-tenancy) | Pas d'auth custom, politiques RLS sur toutes les tables |
| Stripe Connect Express | PRD (intégrations) | Flux onboarding Stripe pour chaque loueur, webhooks spécifiques |
| shadcn/ui (Radix + Tailwind) | UX spec (design system) | Composants copy-paste, thème custom, accessibilité native |
| Bricolage Grotesque | UX spec (typographie) | Font variable, chargement optimisé |
| WCAG 2.1 AA | UX spec (accessibilité) | Contrastes, cibles tactiles, navigation clavier |

### Cross-Cutting Concerns Identified

1. **Multi-tenant isolation (RLS)** — Chaque requête DB doit être scopée par `shop_id`, politiques différenciées par rôle
2. **RBAC (owner/employee/public)** — Middleware + RLS + UI conditionnelle sur toutes les routes
3. **Double flux Stripe** — Subscriptions (SaaS) + Connect (transactionnel), 2 sets de webhooks, idempotence obligatoire
4. **Calcul de disponibilité** — Requête critique cross-tables (products × units × reservations × dates), utilisée dans le tunnel ET le dashboard
5. **Génération PDF** — Factures conformes côté serveur, mentions légales dynamiques par loueur
6. **Emails transactionnels (Resend)** — Confirmation résa, facture, invitation employé, fin d'essai, relance
7. **SEO & ISR** — Pages publiques avec revalidation on-demand, meta tags, sitemap, rendu serveur
8. **Validation (Zod)** — Schémas partagés entre front et API routes, attributs dynamiques à valider
9. **Error monitoring (Sentry)** — Capture avec shop_id + user context sur toutes les routes
10. **File storage (Supabase Storage)** — Buckets par type (logos, products, landing, invoices), nettoyage auto

## Starter Template Evaluation

### Primary Technology Domain

Full-stack web (Next.js 15 App Router + Supabase BaaS) basé sur les exigences du PRD.

### Starter Options Considered

| Option | Stack | Pour | Contre |
|--------|-------|------|--------|
| Official Supabase Starter | Next.js 15, Supabase Auth, Tailwind, TypeScript | Auth SSR/cookies pré-configuré, minimal, pas d'opinions métier | shadcn/ui et Stripe à ajouter |
| next-supabase-stripe-starter | Next.js 15, Supabase, Stripe, shadcn/ui, Resend | SaaS-ready, Stripe Subscriptions câblé | Pas de Stripe Connect, structure imposée |
| Plain create-next-app | Next.js 15, TypeScript | Contrôle total | Trop de boilerplate auth/Supabase |

### Selected Starter: Official Supabase Next.js Starter

**Rationale :**
- Résout la partie la plus critique : auth cookie-based avec `@supabase/ssr` et middleware Next.js
- Pas de logique métier imposée — Rentic nécessite une architecture custom (multi-tenant, double Stripe, website builder)
- Fondation propre sur laquelle on construit notre propre architecture de features

**Initialization Command:**

```bash
npx create-next-app -e with-supabase rentic
cd rentic
npx shadcn@latest init
```

**Architectural Decisions Provided by Starter:**

**Language & Runtime:**
- TypeScript strict mode
- Next.js 15 App Router
- React Server Components par défaut

**Styling Solution:**
- Tailwind CSS configuré
- shadcn/ui ajouté manuellement (Radix UI + Tailwind)

**Build Tooling:**
- Turbopack (Next.js dev)
- Vercel deployment-ready

**Testing Framework:**
- Non inclus — à configurer (Vitest + Playwright recommandés)

**Code Organization:**
- App Router structure (`app/`, `components/`, `utils/`)
- Supabase clients (`utils/supabase/server.ts`, `utils/supabase/client.ts`)
- Middleware auth (`middleware.ts`)

**Development Experience:**
- Hot reload via Turbopack
- Supabase local development (`supabase start`)
- TypeScript autocompletion avec types Supabase générés

**Note:** L'initialisation du projet avec cette commande sera la première story d'implémentation.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Next.js 16 (dernière stable, App Router)
- Supabase PostgreSQL avec RLS multi-tenant
- EAV pour les attributs dynamiques
- Double flux Stripe (Subscriptions + Connect Express)
- Server Actions + API Routes (hybride)

**Important Decisions (Shape Architecture):**
- TanStack Query pour le state management interactif
- React Hook Form + Zod pour la validation
- Supabase Realtime pour le dashboard
- Vitest + Playwright pour les tests

**Deferred Decisions (Post-MVP):**
- PWA / Service Workers
- Multi-langue (i18n)
- Cache Redis (scaling horizontal)

### Data Architecture

| Décision | Choix | Version | Rationale |
|----------|-------|---------|-----------|
| Base de données | Supabase PostgreSQL | supabase-js v2.98 | BaaS intégré (Auth + Storage + Realtime + RLS) |
| Attributs dynamiques | **EAV** (Entity-Attribute-Value) | — | Table `category_attributes` définit le schéma par catégorie, table `attribute_values` stocke les données. Permet la validation stricte, les requêtes par attribut, et l'indexation. Flexible pour le multi-sport |
| Validation | Zod | latest | Schémas partagés front/back, validation Server Actions + API Routes, validation dynamique des attributs EAV via schéma généré depuis `category_attributes` |
| Migrations | Supabase Migrations | CLI natif | `supabase migration new`, versionné dans git, appliqué via `supabase db push` |
| Caching données | TanStack Query (client) + ISR (pages publiques) | v5 | Cache intelligent côté client pour le dashboard, ISR avec revalidation on-demand pour les sites publics |
| Prévention double-booking | Transaction PostgreSQL + `SELECT ... FOR UPDATE` | — | Verrouillage pessimiste sur les unités physiques lors de la création de réservation |

**Architecture EAV détaillée :**

```
category_attributes (définit le schéma)
├── id, category_id, name, label, type (text/number/select)
├── applies_to (product | participant)
├── is_required, options (jsonb pour select), sort_order
└── shop_id (RLS)

product_attribute_values (données produit)
├── id, product_id, category_attribute_id, value_text, value_number
└── shop_id (RLS)

participant_attribute_values (données participant)
├── id, participant_id, category_attribute_id, value_text, value_number
└── shop_id (RLS)
```

### Authentication & Security

| Décision | Choix | Rationale |
|----------|-------|-----------|
| Authentification | Supabase Auth (email/password) | Cookie-based SSR, middleware Next.js, gestion sessions serveur |
| Autorisation | RLS PostgreSQL + middleware Next.js | RLS = isolation données, middleware = protection routes |
| Pattern RLS | Fonction helper `get_user_shop_id()` | Centralise la résolution shop_id, utilisée dans toutes les politiques |
| Sessions | Expiration 30min inactivité (NFR9) | Configuré via Supabase Auth settings |
| Webhooks | Vérification signature Stripe (`constructEvent`) | NFR7 : signature cryptographique obligatoire |
| Rate limiting | Vercel Edge Middleware | Protection tunnel public + webhooks, pas de dépendance externe |
| RGPD | Suppression en cascade + export données | Droit à l'effacement via `ON DELETE CASCADE` sur les tables liées |

### API & Communication Patterns

| Décision | Choix | Rationale |
|----------|-------|-----------|
| Mutations dashboard | **Server Actions** | Formulaires CRUD, validation Zod intégrée, pas de route API à maintenir |
| Webhooks Stripe | **API Routes** (`app/api/webhooks/`) | Endpoints publics, vérification signature, idempotence |
| Tunnel disponibilité | **API Routes** (`app/api/availability/`) | Endpoint public, cacheable, appelé sans auth |
| Revalidation ISR | **API Routes** (`app/api/revalidate/`) | Triggered par Server Actions après modification du site |
| Real-time dashboard | **Supabase Realtime** (channels par shop_id) | NFR : stock < 5s, réservations instantanées |
| Real-time métriques | **Polling TanStack Query** (60s) | Métriques moins critiques, pas besoin d'instantanéité |
| Error handling | Pattern `Result<T, E>` + Zod errors | Server Actions retournent `{ success, data, error }`, pas de throw |
| Emails | Resend API + React Email templates | Emails transactionnels typés, templates React réutilisables |

### Frontend Architecture

| Décision | Choix | Version | Rationale |
|----------|-------|---------|-----------|
| Framework | Next.js | 16.1 | Dernière stable, App Router, Turbopack FS caching, Server Components |
| State management | TanStack Query | v5 | Cache, invalidation, mutations optimistes pour le dashboard interactif |
| Formulaires | React Hook Form + Zod | latest | Synergie shadcn/ui, validation client+serveur avec schémas partagés |
| UI Components | shadcn/ui (Radix + Tailwind) | latest | Accessibilité native (WCAG AA), thème custom, copy-paste |
| Composants serveur | Server Components par défaut | — | Minimum JS client, `"use client"` uniquement pour interactivité |
| Bundle optimization | Dynamic imports + React.lazy | — | Code splitting par route, lazy load des composants lourds (PDF viewer, carte) |

**Stratégie Server/Client Components :**

| Type de page | Rendering | Justification |
|-------------|-----------|---------------|
| Sites publics (`/s/[slug]`) | ISR (Server Components) | SEO, performance, CDN |
| Tunnel réservation | Client Components | Interactivité (drawer, panier, formulaires dynamiques) |
| Dashboard | Hybrid (Server + Client) | Layout serveur, widgets interactifs client (toggle, polling) |
| Auth pages | Server Components | Formulaires simples, pas d'état complexe |

### Infrastructure & Deployment

| Décision | Choix | Rationale |
|----------|-------|-----------|
| Hosting | Vercel Pro | ISR natif, Edge Middleware, déploiement git push |
| Base de données | Supabase Cloud (Pro) | PostgreSQL managé, RLS, Realtime, Storage, Auth |
| CI/CD | GitHub Actions | Tests + lint + type-check avant déploiement Vercel |
| Testing unitaire | Vitest | Rapide, TypeScript natif, compatible Vite |
| Testing E2E | Playwright | Multi-browser, API moderne, fiable |
| Monitoring | Sentry (Next.js SDK) | Erreurs + performance, context shop_id + user |
| Analytics | Vercel Analytics | Intégré au déploiement, Web Vitals |
| Stockage fichiers | Supabase Storage | Buckets : `logos`, `products`, `landing`, `invoices` |
| PDF | @react-pdf/renderer | Server-side dans API Route, factures conformes |
| Carte | Leaflet + OpenStreetMap | Client-side, gratuit, pas de clé API |

### Decision Impact Analysis

**Implementation Sequence:**
1. Projet init (Next.js 16 + shadcn/ui + Supabase)
2. Schema DB + migrations (tables + RLS + EAV)
3. Auth + middleware + RBAC
4. Catalogue + attributs EAV
5. Réservations + disponibilité + double-booking
6. Stripe (Subscriptions + Connect)
7. Website builder + ISR
8. Dashboard + Realtime
9. Emails + PDF
10. Testing + monitoring

**Cross-Component Dependencies:**
- EAV → affecte Catalogue, Tunnel, Réservations (validation dynamique partout)
- RLS → affecte toutes les requêtes DB (doit être en place dès le début)
- Stripe Connect → affecte Paiements + Onboarding (compte Express par loueur)
- ISR → affecte Website Builder + SEO (revalidation on-demand à câbler)
- TanStack Query → affecte Dashboard + Toggle vue résa/matériel (cache + invalidation)

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**15 zones de conflit potentiel** identifiées entre agents AI, regroupées en 5 catégories.

### Naming Patterns

**Database Naming (PostgreSQL) :**

| Élément | Convention | Exemple |
|---------|-----------|---------|
| Tables | snake_case, pluriel | `reservations`, `category_attributes`, `item_units` |
| Colonnes | snake_case | `shop_id`, `start_date`, `is_active` |
| Foreign keys | `{table_singulier}_id` | `shop_id`, `category_id`, `reservation_id` |
| Index | `idx_{table}_{colonnes}` | `idx_reservations_shop_id_start_date` |
| Contraintes unique | `uq_{table}_{colonnes}` | `uq_shops_slug` |
| Fonctions RLS | `get_{info}()` | `get_user_shop_id()`, `get_user_role()` |
| Enums | snake_case | `reservation_status`, `attribute_type` |
| Migrations | `{timestamp}_{description}.sql` | `20260309120000_create_shops.sql` |

**API & Routes Naming :**

| Élément | Convention | Exemple |
|---------|-----------|---------|
| App Router routes | kebab-case | `app/(dashboard)/reservations/page.tsx` |
| API Routes | kebab-case | `app/api/webhooks/stripe-connect/route.ts` |
| Dynamic segments | `[paramName]` camelCase | `[shopSlug]`, `[reservationId]` |
| Query params | camelCase | `?startDate=2026-01-01&shopId=abc` |
| Server Actions | `{verb}{Noun}Action` | `createReservationAction`, `updateShopAction` |

**Code Naming (TypeScript) :**

| Élément | Convention | Exemple |
|---------|-----------|---------|
| Fichiers composants | kebab-case | `reservation-card.tsx`, `day-view-toggle.tsx` |
| Fichiers utilitaires | kebab-case | `format-date.ts`, `get-availability.ts` |
| Composants React | PascalCase | `ReservationCard`, `DayViewToggle` |
| Fonctions / hooks | camelCase | `useReservations()`, `formatCurrency()` |
| Variables / constantes | camelCase | `shopId`, `reservationStatus` |
| Types / Interfaces | PascalCase | `Reservation`, `ShopSettings`, `CategoryAttribute` |
| Enums TS | PascalCase + PascalCase values | `ReservationStatus.InProgress` |
| Constantes globales | SCREAMING_SNAKE | `MAX_PARTICIPANTS`, `DEFAULT_CURRENCY` |

### Structure Patterns

**Organisation par feature :**

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Route group : login, signup, onboarding
│   ├── (dashboard)/              # Route group : app dashboard (protégé)
│   ├── s/[shopSlug]/             # Sites publics des loueurs (ISR)
│   └── api/                      # API Routes (webhooks, availability, revalidate)
├── features/                     # Modules métier (autonomes)
│   ├── auth/                     # Auth + middleware + guards
│   ├── catalog/                  # Catégories, produits, attributs EAV
│   ├── reservations/             # CRUD réservations, disponibilité
│   ├── packs/                    # Packs et produits groupés
│   ├── payments/                 # Stripe Subscriptions + Connect
│   ├── website-builder/          # Landing page builder + ISR
│   ├── dashboard/                # Métriques, toggle vue résa/matériel
│   ├── invoicing/                # Génération PDF + envoi email
│   ├── employees/                # Invitation, rôles, gestion
│   └── subscriptions/            # Gestion abonnement SaaS
├── components/                   # Composants UI réutilisables (agnostiques)
│   ├── ui/                       # shadcn/ui components
│   └── shared/                   # Composants partagés custom
├── lib/                          # Utilitaires transversaux
│   ├── supabase/                 # Clients serveur + client
│   ├── stripe/                   # Config Stripe + helpers
│   ├── email/                    # Templates React Email + helpers Resend
│   └── utils/                    # Formatage, dates, validation
├── types/                        # Types globaux (Database, Supabase generated)
└── config/                       # Configuration app (constantes, env)
```

**Structure interne d'une feature :**

```
features/reservations/
├── actions.ts                    # Server Actions (createReservationAction, etc.)
├── actions.test.ts               # Tests co-localisés
├── queries.ts                    # Fonctions de lecture DB (getReservations, etc.)
├── queries.test.ts               # Tests co-localisés
├── components/                   # Composants spécifiques à cette feature
│   ├── reservation-card.tsx
│   ├── reservation-list.tsx
│   └── reservation-form.tsx
├── hooks/                        # Hooks spécifiques
│   └── use-reservations.ts
├── schemas.ts                    # Schémas Zod de validation
├── types.ts                      # Types spécifiques à la feature
└── utils.ts                      # Helpers spécifiques
```

**Tests E2E :**

```
e2e/
├── onboarding.spec.ts
├── reservations.spec.ts
├── tunnel.spec.ts
└── fixtures/                     # Données de test
```

### Format Patterns

**Server Actions — Format de retour obligatoire :**

```typescript
// Toutes les Server Actions retournent ce type
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> }

// Exemple
async function createReservationAction(formData: FormData): Promise<ActionResult<Reservation>> {
  const parsed = reservationSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { success: false, error: "Validation échouée", fieldErrors: parsed.error.flatten().fieldErrors }
  }
  // ...
  return { success: true, data: reservation }
}
```

**API Routes — Format de réponse :**

```typescript
// Succès
NextResponse.json({ data: result }, { status: 200 })

// Erreur
NextResponse.json({ error: { message: "Not found", code: "NOT_FOUND" } }, { status: 404 })

// Webhooks : toujours 200 même en cas d'erreur de traitement (éviter les retries Stripe inutiles)
```

**Data Exchange :**

| Élément | Convention |
|---------|-----------|
| JSON fields (API ↔ Front) | camelCase |
| JSON fields (DB ↔ Back) | snake_case (natif PostgreSQL) |
| Conversion | Supabase JS fait le mapping automatiquement |
| Dates en JSON | ISO 8601 strings (`2026-03-09T10:00:00Z`) |
| Montants | Centimes (integer) pour Stripe, euros (number) pour l'affichage |
| Booleans | `true`/`false` (jamais 0/1) |
| Null handling | `null` explicite (jamais `undefined` dans les réponses API) |

### Communication Patterns

**Supabase Realtime — Channels :**

```typescript
// Convention : channel par shop + domaine
const channel = supabase.channel(`shop:${shopId}:reservations`)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'reservations',
    filter: `shop_id=eq.${shopId}`
  }, handleChange)
```

**TanStack Query — Query Keys :**

```typescript
// Convention : tableau hiérarchique [domaine, scope, filters]
const queryKeys = {
  reservations: {
    all: (shopId: string) => ['reservations', shopId] as const,
    list: (shopId: string, filters: Filters) => ['reservations', shopId, 'list', filters] as const,
    detail: (shopId: string, id: string) => ['reservations', shopId, 'detail', id] as const,
  },
  catalog: {
    all: (shopId: string) => ['catalog', shopId] as const,
    categories: (shopId: string) => ['catalog', shopId, 'categories'] as const,
    products: (shopId: string, categoryId: string) => ['catalog', shopId, 'products', categoryId] as const,
  }
}
```

**Invalidation après mutation :**

```typescript
// Toujours invalider via queryClient après une Server Action réussie
const result = await createReservationAction(formData)
if (result.success) {
  queryClient.invalidateQueries({ queryKey: queryKeys.reservations.all(shopId) })
}
```

### Process Patterns

**Error Handling :**

| Couche | Pattern |
|--------|---------|
| Server Actions | Retourner `ActionResult<T>` — jamais `throw` |
| API Routes | `try/catch` → `NextResponse.json({ error })` avec status code approprié |
| Client Components | `error.tsx` boundary par route + toast pour les erreurs d'action |
| Sentry | Capture automatique via SDK, enrichi avec `Sentry.setContext('shop', { shopId })` |
| Logs serveur | `console.error` en dev, Sentry en prod — jamais `console.log` en prod |

**Loading States :**

| Contexte | Pattern |
|----------|---------|
| Navigation entre pages | `loading.tsx` par route (Next.js Suspense) |
| Server Actions | `useFormStatus()` → `pending` pour désactiver le bouton |
| TanStack Query | `isLoading` / `isFetching` / `isError` du hook |
| Squelettes | Composant `Skeleton` de shadcn/ui pour les chargements initiaux |
| Polling | Indicateur discret (badge ou dot) quand `isFetching && !isLoading` |

**Validation :**

| Couche | Pattern |
|--------|---------|
| Client | React Hook Form + Zod schema (validation temps réel) |
| Server Actions | `schema.safeParse()` — première ligne de chaque action |
| API Routes | `schema.safeParse()` sur le body |
| DB | Contraintes PostgreSQL (NOT NULL, CHECK, UNIQUE) en dernier rempart |
| Attributs EAV | Schéma Zod dynamique généré depuis `category_attributes` |

### Enforcement Guidelines

**Tous les agents AI DOIVENT :**

1. Suivre les naming conventions sans exception (kebab-case fichiers, snake_case DB, camelCase code)
2. Retourner `ActionResult<T>` depuis toutes les Server Actions
3. Co-localiser les tests avec les fichiers source
4. Organiser le code par feature dans `features/`
5. Utiliser les Zod schemas pour toute validation (client ET serveur)
6. Enrichir Sentry avec `shopId` et `userId` dans chaque contexte d'erreur
7. Utiliser les query keys standardisées pour TanStack Query
8. Ne jamais `throw` dans les Server Actions — toujours retourner un `ActionResult`

**Anti-Patterns à éviter :**

- Créer des fichiers dans `components/` pour des composants spécifiques à une feature → utiliser `features/{feature}/components/`
- Utiliser `any` dans TypeScript → toujours typer explicitement
- Faire des requêtes Supabase directement depuis les composants → passer par `queries.ts` ou `actions.ts`
- Mixer snake_case et camelCase dans le même contexte
- Créer des API Routes quand une Server Action suffit

## Project Structure & Boundaries

### Complete Project Directory Structure

```
rentic/
├── .github/
│   └── workflows/
│       ├── ci.yml                          # Lint + type-check + tests unitaires
│       └── e2e.yml                         # Tests Playwright
├── .env.local                              # Variables locales (gitignored)
├── .env.example                            # Template des variables requises
├── .gitignore
├── next.config.ts                          # Config Next.js 16 (ISR, images, redirects)
├── tailwind.config.ts                      # Tailwind + shadcn/ui theme Rentic
├── tsconfig.json
├── components.json                         # Config shadcn/ui
├── package.json
├── vitest.config.ts
├── playwright.config.ts
├── sentry.client.config.ts
├── sentry.server.config.ts
├── middleware.ts                            # Auth Supabase + RBAC + rate limiting
│
├── supabase/
│   ├── config.toml                         # Config Supabase local
│   ├── seed.sql                            # Données de développement
│   └── migrations/
│       ├── 00001_create_shops.sql
│       ├── 00002_create_profiles.sql
│       ├── 00003_create_categories_and_attributes.sql
│       ├── 00004_create_products_and_units.sql
│       ├── 00005_create_packs.sql
│       ├── 00006_create_reservations.sql
│       ├── 00007_create_payments.sql
│       ├── 00008_create_subscriptions.sql
│       ├── 00009_create_landing_pages.sql
│       ├── 00010_create_rls_policies.sql
│       └── 00011_create_functions.sql
│
├── public/
│   ├── fonts/
│   │   └── bricolage-grotesque.woff2       # Font variable
│   ├── og-image.png
│   └── favicon.ico
│
├── e2e/
│   ├── onboarding.spec.ts
│   ├── catalog.spec.ts
│   ├── reservations.spec.ts
│   ├── tunnel.spec.ts
│   ├── website-builder.spec.ts
│   └── fixtures/
│       ├── test-shop.ts
│       └── test-user.ts
│
└── src/
    ├── app/
    │   ├── globals.css                      # Tailwind imports + theme tokens
    │   ├── layout.tsx                       # Root layout (font, metadata)
    │   ├── not-found.tsx
    │   ├── error.tsx                        # Global error boundary
    │   │
    │   ├── (auth)/
    │   │   ├── login/page.tsx
    │   │   ├── signup/page.tsx
    │   │   ├── forgot-password/page.tsx
    │   │   ├── reset-password/page.tsx
    │   │   ├── confirm/page.tsx
    │   │   └── layout.tsx                   # Layout auth (centré, sans sidebar)
    │   │
    │   ├── onboarding/
    │   │   ├── page.tsx                     # Redirect vers l'étape courante
    │   │   ├── layout.tsx                   # Layout onboarding (stepper)
    │   │   ├── profile/page.tsx
    │   │   ├── shop/page.tsx
    │   │   └── category/page.tsx
    │   │
    │   ├── (dashboard)/
    │   │   ├── layout.tsx                   # Sidebar + header + auth guard
    │   │   ├── loading.tsx                  # Skeleton global dashboard
    │   │   ├── page.tsx                     # Dashboard home (métriques + résa du jour)
    │   │   ├── reservations/
    │   │   │   ├── page.tsx                 # Liste réservations (4 onglets)
    │   │   │   ├── [reservationId]/page.tsx # Détail réservation
    │   │   │   ├── new/page.tsx             # Réservation manuelle
    │   │   │   └── loading.tsx
    │   │   ├── inventory/
    │   │   │   ├── page.tsx                 # Stock global (produits)
    │   │   │   ├── units/page.tsx           # Unités physiques
    │   │   │   └── loading.tsx
    │   │   ├── packs/
    │   │   │   ├── page.tsx                 # Packs et prix
    │   │   │   └── loading.tsx
    │   │   ├── website/
    │   │   │   ├── page.tsx                 # Website builder + preview
    │   │   │   └── loading.tsx
    │   │   └── settings/
    │   │       ├── page.tsx                 # Infos magasin
    │   │       ├── employees/page.tsx
    │   │       ├── subscription/page.tsx
    │   │       └── loading.tsx
    │   │
    │   ├── s/[shopSlug]/
    │   │   ├── page.tsx                     # Landing page loueur (ISR)
    │   │   ├── book/page.tsx                # Tunnel de réservation
    │   │   ├── legal/page.tsx               # CGV/CGU
    │   │   ├── layout.tsx                   # Layout public (header + footer)
    │   │   └── opengraph-image.tsx          # OG image dynamique
    │   │
    │   └── api/
    │       ├── webhooks/
    │       │   ├── stripe-subscriptions/route.ts
    │       │   └── stripe-connect/route.ts
    │       ├── availability/route.ts         # GET dispo publique (cacheable)
    │       ├── revalidate/route.ts           # POST revalidation ISR
    │       └── invoices/[reservationId]/route.ts  # GET PDF facture
    │
    ├── features/
    │   ├── auth/
    │   │   ├── actions.ts                   # loginAction, signupAction, logoutAction
    │   │   ├── actions.test.ts
    │   │   ├── queries.ts                   # getSession, getProfile
    │   │   ├── guards.ts                    # requireAuth, requireOwner
    │   │   ├── schemas.ts                   # loginSchema, signupSchema
    │   │   ├── types.ts
    │   │   └── components/
    │   │       ├── login-form.tsx
    │   │       └── signup-form.tsx
    │   │
    │   ├── catalog/
    │   │   ├── actions.ts                   # CRUD catégories, produits, attributs
    │   │   ├── actions.test.ts
    │   │   ├── queries.ts                   # getCategories, getProducts, getAttributes
    │   │   ├── queries.test.ts
    │   │   ├── schemas.ts                   # categorySchema, productSchema, attributeSchema
    │   │   ├── types.ts
    │   │   ├── utils.ts                     # buildDynamicSchema (EAV → Zod)
    │   │   ├── utils.test.ts
    │   │   └── components/
    │   │       ├── category-form.tsx
    │   │       ├── product-form.tsx
    │   │       ├── product-list.tsx
    │   │       ├── attribute-editor.tsx
    │   │       └── unit-table.tsx
    │   │
    │   ├── packs/
    │   │   ├── actions.ts
    │   │   ├── queries.ts
    │   │   ├── schemas.ts
    │   │   ├── types.ts
    │   │   └── components/
    │   │       ├── pack-form.tsx
    │   │       └── pack-list.tsx
    │   │
    │   ├── reservations/
    │   │   ├── actions.ts                   # createReservation, updateStatus, cancelReservation
    │   │   ├── actions.test.ts
    │   │   ├── queries.ts                   # getReservations, getReservationDetail, getPreparation
    │   │   ├── queries.test.ts
    │   │   ├── availability.ts              # checkAvailability, calculatePrice
    │   │   ├── availability.test.ts
    │   │   ├── schemas.ts
    │   │   ├── types.ts
    │   │   └── components/
    │   │       ├── reservation-card.tsx
    │   │       ├── reservation-list.tsx
    │   │       ├── reservation-form.tsx
    │   │       ├── material-card.tsx
    │   │       ├── material-section.tsx
    │   │       ├── day-view-toggle.tsx
    │   │       └── preparation-header.tsx
    │   │
    │   ├── payments/
    │   │   ├── actions.ts                   # createCheckoutSession, recordCashPayment
    │   │   ├── actions.test.ts
    │   │   ├── queries.ts
    │   │   ├── webhooks.ts                  # handleSubscriptionWebhook, handleConnectWebhook
    │   │   ├── webhooks.test.ts
    │   │   ├── schemas.ts
    │   │   ├── types.ts
    │   │   └── components/
    │   │       └── payment-status.tsx
    │   │
    │   ├── subscriptions/
    │   │   ├── actions.ts                   # createSubscription, cancelSubscription
    │   │   ├── queries.ts                   # getSubscriptionStatus
    │   │   ├── schemas.ts
    │   │   ├── types.ts
    │   │   └── components/
    │   │       ├── plan-selector.tsx
    │   │       └── subscription-status.tsx
    │   │
    │   ├── website-builder/
    │   │   ├── actions.ts                   # updateLandingPage, updateSEO
    │   │   ├── queries.ts                   # getLandingPage, getPublicShopData
    │   │   ├── schemas.ts
    │   │   ├── types.ts
    │   │   └── components/
    │   │       ├── section-editor.tsx
    │   │       ├── hero-editor.tsx
    │   │       ├── preview-frame.tsx
    │   │       └── seo-editor.tsx
    │   │
    │   ├── tunnel/
    │   │   ├── actions.ts                   # submitBooking, validateCart
    │   │   ├── queries.ts                   # getShopCatalog, getAvailability
    │   │   ├── schemas.ts
    │   │   ├── types.ts
    │   │   └── components/
    │   │       ├── equipment-drawer.tsx
    │   │       ├── booking-cart.tsx
    │   │       ├── date-picker.tsx
    │   │       ├── participant-form.tsx
    │   │       └── product-grid.tsx
    │   │
    │   ├── dashboard/
    │   │   ├── queries.ts                   # getMetrics, getTodayReservations
    │   │   ├── types.ts
    │   │   └── components/
    │   │       ├── metrics-cards.tsx
    │   │       ├── today-reservations.tsx
    │   │       └── occupation-chart.tsx
    │   │
    │   ├── invoicing/
    │   │   ├── actions.ts                   # generateInvoice, sendInvoiceEmail
    │   │   ├── queries.ts
    │   │   ├── types.ts
    │   │   └── templates/
    │   │       └── invoice-pdf.tsx           # @react-pdf/renderer template
    │   │
    │   ├── employees/
    │   │   ├── actions.ts                   # inviteEmployee, deactivateEmployee
    │   │   ├── queries.ts
    │   │   ├── schemas.ts
    │   │   ├── types.ts
    │   │   └── components/
    │   │       └── employee-list.tsx
    │   │
    │   └── onboarding/
    │       ├── actions.ts                   # completeStep, createShop
    │       ├── queries.ts                   # getOnboardingStatus
    │       ├── schemas.ts
    │       ├── types.ts
    │       └── components/
    │           └── onboarding-step.tsx
    │
    ├── components/
    │   ├── ui/                              # shadcn/ui (auto-generated)
    │   │   ├── button.tsx
    │   │   ├── card.tsx
    │   │   ├── dialog.tsx
    │   │   ├── drawer.tsx
    │   │   ├── form.tsx
    │   │   ├── input.tsx
    │   │   ├── select.tsx
    │   │   ├── sheet.tsx
    │   │   ├── skeleton.tsx
    │   │   ├── table.tsx
    │   │   ├── tabs.tsx
    │   │   ├── toast.tsx
    │   │   └── ...
    │   └── shared/
    │       ├── sidebar.tsx                  # Sidebar dashboard
    │       ├── data-table.tsx               # Table réutilisable avec filtres
    │       ├── file-upload.tsx              # Upload images Supabase Storage
    │       ├── date-range-picker.tsx
    │       ├── search-input.tsx
    │       └── empty-state.tsx
    │
    ├── lib/
    │   ├── supabase/
    │   │   ├── server.ts                    # createServerClient()
    │   │   ├── client.ts                    # createBrowserClient()
    │   │   ├── admin.ts                     # createServiceRoleClient() (API routes only)
    │   │   └── middleware.ts                # updateSession()
    │   ├── stripe/
    │   │   ├── client.ts                    # Stripe instance
    │   │   ├── subscriptions.ts             # Helpers abonnement
    │   │   └── connect.ts                   # Helpers Connect Express
    │   ├── email/
    │   │   ├── send.ts                      # Helper Resend
    │   │   └── templates/
    │   │       ├── reservation-confirmation.tsx
    │   │       ├── invoice.tsx
    │   │       ├── employee-invitation.tsx
    │   │       └── trial-ending.tsx
    │   └── utils/
    │       ├── format-date.ts
    │       ├── format-currency.ts
    │       ├── cn.ts                        # Tailwind merge utility
    │       └── query-keys.ts                # TanStack Query keys centralisées
    │
    ├── types/
    │   ├── database.ts                      # Types générés par Supabase CLI
    │   └── global.ts                        # Types partagés (ActionResult, etc.)
    │
    └── config/
        ├── site.ts                          # Metadata, URLs, constantes
        ├── navigation.ts                    # Items sidebar par rôle
        └── plans.ts                         # Plans d'abonnement (prix, features)
```

### Architectural Boundaries

**API Boundaries :**

| Boundary | Route | Auth | Usage |
|----------|-------|------|-------|
| Webhooks Stripe Subscriptions | `api/webhooks/stripe-subscriptions` | Signature Stripe | Événements abonnement SaaS |
| Webhooks Stripe Connect | `api/webhooks/stripe-connect` | Signature Stripe | Paiements clients |
| Disponibilité publique | `api/availability` | Aucune | Tunnel résa (GET cacheable) |
| Revalidation ISR | `api/revalidate` | Token secret | Triggered après edit site |
| Facture PDF | `api/invoices/[reservationId]` | Auth Supabase | Téléchargement PDF |

**Data Boundaries :**

| Couche | Accès DB | Pattern |
|--------|----------|---------|
| Server Components | Via `queries.ts` (feature) | Lecture directe Supabase server client |
| Server Actions | Via `actions.ts` (feature) | Mutations avec validation Zod |
| Client Components | Via TanStack Query hooks | Cache + invalidation, appelle `queries.ts` via Server Components |
| API Routes | Via `lib/supabase/admin.ts` | Service role pour webhooks (bypass RLS) |

**Feature Boundaries — Règle clé :**
- Une feature peut importer depuis `lib/`, `components/`, `types/`, `config/`
- Une feature ne peut **jamais** importer directement depuis une autre feature
- Les dépendances cross-feature passent par la DB ou par des composants dans `components/shared/`

### Requirements to Structure Mapping

| FR Group | Feature | Route Dashboard | Route Publique |
|----------|---------|----------------|----------------|
| FR1-FR6 (Comptes & Accès) | `auth/`, `employees/`, `onboarding/` | `(auth)/`, `onboarding/`, `settings/employees/` | — |
| FR7-FR12 (Catalogue) | `catalog/` | `(dashboard)/inventory/` | — |
| FR13-FR15 (Packs) | `packs/` | `(dashboard)/packs/` | — |
| FR16-FR24 (Réservations) | `reservations/`, `tunnel/` | `(dashboard)/reservations/` | `s/[shopSlug]/book/` |
| FR25-FR30 (Site Web) | `website-builder/` | `(dashboard)/website/` | `s/[shopSlug]/` |
| FR31-FR35 (Paiements) | `payments/`, `invoicing/` | — | — |
| FR36-FR40 (Abonnement) | `subscriptions/` | `settings/subscription/` | — |
| FR41-FR43 (Dashboard) | `dashboard/` | `(dashboard)/` | — |
| FR44-FR47 (Admin) | Stripe Dashboard + Sentry + Vercel Analytics | — | — |

### External Integration Points

| Service | Feature(s) | Fichier(s) |
|---------|-----------|------------|
| Stripe Subscriptions | `subscriptions/`, `payments/` | `lib/stripe/subscriptions.ts`, `api/webhooks/stripe-subscriptions/` |
| Stripe Connect | `payments/`, `tunnel/` | `lib/stripe/connect.ts`, `api/webhooks/stripe-connect/` |
| Supabase Auth | `auth/` | `lib/supabase/server.ts`, `middleware.ts` |
| Supabase Storage | `catalog/`, `website-builder/` | `components/shared/file-upload.tsx` |
| Supabase Realtime | `reservations/`, `dashboard/` | Hooks dans `features/reservations/hooks/` |
| Resend | `invoicing/`, `employees/`, `subscriptions/` | `lib/email/send.ts` |
| Sentry | Transversal | `sentry.client.config.ts`, `sentry.server.config.ts` |
| Leaflet/OSM | `website-builder/` (site public) | Composant dans `s/[shopSlug]/` |

## Architecture Validation Results

### Coherence Validation

**Decision Compatibility :** Toutes les technologies sont compatibles et testées ensemble (Next.js 16 + Supabase + Stripe + shadcn/ui + TanStack Query). Aucun conflit de version détecté.

**Pattern Consistency :** Les conventions de nommage (kebab-case fichiers, snake_case DB, camelCase code) sont cohérentes avec les standards de chaque couche. Le pattern `ActionResult<T>` est compatible avec React 19 `useFormStatus()`.

**Structure Alignment :** La structure par feature supporte l'isolation des domaines métier. Les boundaries (pas d'import cross-feature) garantissent la maintenabilité. L'App Router route groups correspondent aux audiences (auth, dashboard, public).

### Requirements Coverage Validation

**Functional Requirements :** 47/47 FRs couverts par les décisions architecturales. Chaque groupe FR est mappé à un ou plusieurs features avec des fichiers spécifiques.

**Non-Functional Requirements :** 22/22 NFRs adressés. Performance (ISR + TanStack Query), sécurité (RLS + Stripe PCI), scalabilité (Supabase Pro + CDN), fiabilité (webhooks idempotents), accessibilité (Radix WCAG AA).

### Implementation Readiness Validation

**Decision Completeness :** Toutes les décisions critiques sont documentées avec versions vérifiées. Rationale fourni pour chaque choix.

**Structure Completeness :** Arborescence complète avec ~90 fichiers spécifiques. Routes, features, components, lib, types et config définis.

**Pattern Completeness :** Conventions de nommage, format de réponse, query keys, error handling, loading states — tous spécifiés avec exemples.

### Gap Analysis Results

| Gap | Priorité | Résolution |
|-----|----------|-----------|
| Schema DB colonnes détaillées | Important | Référentiel = `bubble-app-analysis.md` + migrations Supabase |
| TTL revalidation ISR | Important | Décision à l'implémentation (ex: 60s catalogue, 3600s landing) |
| Templates de code boilerplate | Nice-to-have | Agents AI peuvent générer à partir des patterns documentés |
| Feature flags | Nice-to-have | Reporté post-MVP |

### Architecture Completeness Checklist

**Requirements Analysis**
- [x] Project context analysé (47 FRs, 22 NFRs, 5 user journeys)
- [x] Complexité évaluée (moyenne-haute)
- [x] Contraintes techniques identifiées (8 contraintes)
- [x] Préoccupations transversales mappées (10 concerns)

**Architectural Decisions**
- [x] Décisions critiques documentées avec versions (Next.js 16.1, Supabase v2.98, Stripe v20.4)
- [x] Stack complète spécifiée (12 technologies)
- [x] Patterns d'intégration définis (Server Actions, API Routes, Realtime, webhooks)
- [x] Considérations de performance adressées (ISR, TanStack Query, index DB)

**Implementation Patterns**
- [x] Conventions de nommage établies (DB, API, Code)
- [x] Patterns de structure définis (feature-based, co-located tests)
- [x] Patterns de communication spécifiés (Realtime, Query Keys, ActionResult)
- [x] Patterns de process documentés (error handling, loading, validation)

**Project Structure**
- [x] Arborescence complète définie (~90 fichiers)
- [x] Boundaries des composants établies
- [x] Points d'intégration mappés (8 services externes)
- [x] Mapping requirements → structure complet

### Architecture Readiness Assessment

**Overall Status :** READY FOR IMPLEMENTATION

**Confidence Level :** HIGH

**Forces clés :**
- Stack cohérente et mature (Next.js + Supabase + Stripe)
- EAV bien pensé pour la flexibilité multi-sport
- Double flux Stripe clairement séparé (Subscriptions vs Connect)
- Patterns d'implémentation détaillés avec exemples de code
- Structure feature-based avec boundaries strictes

**Améliorations futures :**
- Schéma DB complet dans les migrations (story d'init)
- Templates de code pour accélérer le développement
- Feature flags pour le déploiement progressif (post-MVP)

### Implementation Handoff

**Directives pour les agents AI :**
- Suivre toutes les décisions architecturales exactement comme documentées
- Utiliser les patterns d'implémentation de manière cohérente
- Respecter la structure projet et les boundaries entre features
- Consulter ce document pour toute question architecturale

**Première priorité d'implémentation :**
```bash
npx create-next-app -e with-supabase rentic
cd rentic
npx shadcn@latest init
```
