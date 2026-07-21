# Story 1.2 : Schéma de base de données fondation et RLS

Status: review

## Story

As a développeur,
I want le schéma de base de données fondation (shops, profiles, rôles) avec Row Level Security activé,
So that l'isolation multi-tenant est garantie dès le départ.

## Acceptance Criteria

1. **Given** le projet est initialisé (Story 1.1) **When** les migrations Supabase sont exécutées **Then** la table `shops` existe avec les champs essentiels (id, name, slug, created_at)
2. **And** la table `profiles` existe liée à `auth.users` avec champ `role` (owner/employee) et `shop_id`
3. **And** la fonction helper `get_user_shop_id()` est créée pour les policies RLS
4. **And** les policies RLS sont actives sur `shops` et `profiles` — un utilisateur ne voit que les données de son shop
5. **And** un test vérifie qu'un utilisateur du shop A ne peut pas accéder aux données du shop B
6. **And** les migrations sont versionées dans git

## Tasks / Subtasks

- [x] **Task 1 : Migration — tables shops et profiles** (AC: #1, #2)
  - [x] 1.1 Créer le type enum `user_role` (owner, employee)
  - [x] 1.2 Créer la table `shops` avec colonnes fondation
  - [x] 1.3 Créer la table `profiles` liée à `auth.users`
  - [x] 1.4 Créer les index nécessaires (idx_profiles_shop_id, uq_shops_slug)
  - [x] 1.5 Créer le trigger `updated_at` automatique

- [x] **Task 2 : Migration — fonctions helper RLS** (AC: #3)
  - [x] 2.1 Créer `get_user_shop_id()` (SECURITY DEFINER)
  - [x] 2.2 Créer `get_user_role()` (SECURITY DEFINER)

- [x] **Task 3 : Migration — policies RLS** (AC: #4)
  - [x] 3.1 Activer RLS sur shops et profiles
  - [x] 3.2 Créer les policies SELECT/UPDATE sur shops
  - [x] 3.3 Créer les policies SELECT/UPDATE sur profiles

- [x] **Task 4 : Appliquer les migrations** (AC: #6)
  - [x] 4.1 Appliquer les migrations sur le projet Supabase (via MCP)
  - [x] 4.2 Vérifier que les tables existent (list_tables verbose)
  - [x] 4.3 Générer les types TypeScript (generate_typescript_types)

- [x] **Task 5 : Test d'isolation multi-tenant** (AC: #5)
  - [x] 5.1 Test SQL vérifiant l'isolation shop A / shop B — PASSED

- [x] **Task 6 : Commit** (AC: #6)
  - [x] 6.1 Commit 2732a72, poussé sur GitHub

## Dev Notes

### Schema SQL détaillé

**Table shops:**
- id (uuid PK), name (text NOT NULL), slug (text NOT NULL UNIQUE), email (text), phone (text), address (text)
- logo_url (text), siret (text), tva_number (text)
- stripe_connect_id (text), stripe_subscription_id (text), subscription_active (boolean DEFAULT false)
- onboarding_completed (boolean DEFAULT false)
- created_at (timestamptz DEFAULT now()), updated_at (timestamptz DEFAULT now())

**Table profiles:**
- id (uuid PK REFERENCES auth.users ON DELETE CASCADE), shop_id (uuid REFERENCES shops ON DELETE CASCADE)
- role (user_role NOT NULL DEFAULT 'owner'), first_name (text), last_name (text), avatar_url (text)
- onboarding_current_step (integer DEFAULT 1)
- created_at (timestamptz DEFAULT now()), updated_at (timestamptz DEFAULT now())

### RLS Pattern
- `get_user_shop_id()`: STABLE, SECURITY DEFINER, retourne shop_id depuis profiles WHERE id = auth.uid()
- Shops: SELECT/UPDATE limité à `id = get_user_shop_id()`
- Profiles: SELECT limité à `shop_id = get_user_shop_id()`, UPDATE limité à `id = auth.uid()`

### Previous Story Intelligence (1.1)
- Supabase MCP connecté — utiliser pour appliquer les migrations
- Structure src/ en place, types/database.ts à régénérer après migration

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6 (1M context)

### Debug Log References

- Premier test RLS échouait car execute_sql tourne en superuser (bypass RLS) — corrigé avec `set_config('role', 'authenticated', true)`

### Completion Notes List

- Migration unique couvrant enum, tables, triggers, helpers, policies
- Test RLS vérifié : user A ne voit que shop A, user B ne voit que shop B
- Types TypeScript générés automatiquement via MCP Supabase

### File List

- supabase/migrations/20260317000001_create_foundation_schema.sql (new)
- supabase/tests/rls-isolation.sql (new)
- src/types/database.ts (modified — generated types)
