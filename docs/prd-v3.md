# Product Requirements Document (PRD)

## Rentic -- Plateforme SaaS de Gestion de Location Saisonnière

**Version :** 3.0
**Date :** 26 février 2026
**Stack :** Next.js 15, Supabase, shadcn/ui, Stripe, Claude AI
**Déploiement :** Vercel
**Type :** Application web multi-tenant pour commerces de location saisonnière

---

## Table des matières

1. [Executive Summary](#1-executive-summary)
2. [Product Vision & Objectifs](#2-product-vision--objectifs)
3. [Personas](#3-personas)
4. [Architecture Générale](#4-architecture-générale)
5. [Modèle de Données](#5-modèle-de-données)
6. [Modules Fonctionnels](#6-modules-fonctionnels)
   - 6.1 [Auth & Onboarding](#61-auth--onboarding)
   - 6.2 [Gestion du Catalogue](#62-gestion-du-catalogue)
   - 6.3 [Système de Packs & Offres](#63-système-de-packs--offres)
   - 6.4 [Réservations](#64-réservations)
   - 6.5 [Paiements & Facturation](#65-paiements--facturation)
   - 6.6 [Site Web Intégré (Landing Page Builder)](#66-site-web-intégré)
   - 6.7 [Dashboard & Analytics](#67-dashboard--analytics)
   - 6.8 [Paramètres & Équipe](#68-paramètres--équipe)
   - 6.9 [Assistant IA](#69-assistant-ia)
7. [Architecture Technique](#7-architecture-technique)
8. [Sécurité & Permissions](#8-sécurité--permissions)
9. [Roadmap](#9-roadmap)
10. [Métriques de Succès](#10-métriques-de-succès)

---

## 1. Executive Summary

### Problématique

Les propriétaires de boutiques de location saisonnière (ski, VTT, surf, paddle, kayak, etc.) jonglent entre des tableurs, le téléphone et des outils inadaptés pour gérer leur stock, leurs réservations et leur présence en ligne. Les solutions existantes sont trop complexes, trop chères, ou spécialisées sur un seul type d'activité.

### Solution

Rentic est une plateforme SaaS tout-en-un qui s'adapte à **n'importe quel type de location saisonnière** grâce à un système d'attributs personnalisables. Chaque loueur peut :

- Configurer son catalogue avec ses propres catégories, produits et attributs
- Créer des packs et offres commerciales adaptés à son activité
- Prendre des réservations en ligne 24/7 via son propre site web
- Gérer son stock unitaire en temps réel
- Encaisser les paiements en ligne et en magasin
- Bénéficier d'un assistant IA pour optimiser son activité

### Valeur ajoutée

| Pour le loueur | Pour le client final |
|----------------|---------------------|
| Solution clé en main, opérationnelle en 15 minutes | Réservation en ligne simple et rapide |
| Adaptable à tout type d'activité sans développement | Disponibilités en temps réel |
| Packs et offres intelligentes pour augmenter le panier moyen | Paiement sécurisé + confirmation instantanée |
| Assistant IA pour optimiser les promos et le stock | Préparation du matériel en amont (morphologie) |
| Site web professionnel sans compétence technique | Transparence sur les tarifs et conditions |

---

## 2. Product Vision & Objectifs

### Vision

Devenir la plateforme de référence pour les commerces de location saisonnière, quel que soit leur secteur, en offrant une solution simple, intelligente et évolutive.

### Objectifs Business

1. **Universalité** : S'adapter à tout type de location (ski, VTT, surf, paddle, kayak, trottinettes, camping, costumes, outils...) sans modification du code
2. **Simplicité** : Un loueur doit pouvoir être opérationnel en 15 minutes (onboarding → site en ligne)
3. **Intelligence** : L'IA aide activement le loueur à optimiser son activité (promos, stock, pricing)
4. **Rentabilité** : Augmenter le CA des loueurs via les packs, promos intelligentes et réservations 24/7

### Objectifs Utilisateur

1. Réduire le temps de gestion quotidienne de 50%
2. Augmenter les réservations en ligne de 30%
3. Éliminer les erreurs de double-booking
4. Augmenter le panier moyen grâce aux packs et à l'IA

---

## 3. Personas

### Persona 1 : Jean, 38 ans -- Loueur de ski à Courchevel

- 100+ paires de ski, 80 paires de chaussures, casques, bâtons
- A besoin de connaître taille, poids et pointure des clients avant l'arrivée
- Veut proposer des packs (ski + chaussures + bâtons)
- Forte affluence vacances scolaires, équipe de 3-4 en saison

> *"Je dois préparer le matériel avant que les clients arrivent. Un pack ski complet avec les bonnes tailles, c'est ce qui me fait gagner du temps."*

### Persona 2 : Marc, 45 ans -- Loueur de VTT en Ardèche

- 30 VTT de différentes tailles (S à XL), casques, protections
- Saison de 4 mois, équipe réduite (2 personnes)
- Veut des packs (vélo + casque + protections)
- Pas de présence web actuelle

> *"J'ai besoin d'un site pro pour que les gens réservent même quand je suis sur les sentiers avec un groupe."*

### Persona 3 : Léa, 30 ans -- Location de paddles à Biarritz

- 20 paddles rigides + gonflables, combinaisons, gilets
- Location à la journée ou demi-journée
- Clientèle très mobile/touriste
- A besoin de connaître le poids des clients (sécurité)

> *"Si une IA pouvait me dire quand lancer une promo parce que mes paddles sont pas assez loués en milieu de semaine, ça serait top."*

### Persona Client : Sophie, 32 ans -- Vacancière

- En vacances en famille, veut réserver du matériel en avance
- Préfère tout faire en ligne, mobile-first
- Veut un pack "famille" simple avec tout inclus

> *"Je veux réserver en 5 minutes depuis mon canapé, tout payer, et juste aller chercher le matériel le jour J."*

---

## 4. Architecture Générale

### Vue d'ensemble

```
┌─────────────────────────────────────────────────────────┐
│                    RENTIC PLATFORM                       │
├──────────────┬──────────────────┬────────────────────────┤
│  Site Rentic │  App Loueur      │  Site Loueur (public)  │
│  (marketing) │  (back-office)   │  (vitrine + réservation│
│              │                  │   générés dynamiquement)│
│  /           │  /app/*          │  /s/{shop-slug}/*      │
│              │                  │  /r/{shop-slug}/*      │
├──────────────┴──────────────────┴────────────────────────┤
│                   Next.js 15 (App Router)                │
├──────────────────────────────────────────────────────────┤
│  Supabase (PostgreSQL + Auth + Storage + Realtime)       │
├──────────────────────────────────────────────────────────┤
│  Stripe (Connect + Subscriptions)  │  Claude AI (Chat)   │
└──────────────────────────────────────────────────────────┘
```

### Trois espaces distincts

| Espace | Routes | Audience | Auth requise |
|--------|--------|----------|-------------|
| **Site marketing Rentic** | `/` | Prospects loueurs | Non |
| **Application loueur** | `/app/*` | Propriétaires & employés | Oui |
| **Site du loueur** | `/s/{slug}/*`, `/r/{slug}/*` | Clients finaux | Non |

---

## 5. Modèle de Données

### 5.1 Vue d'ensemble

Le modèle est centré sur l'entité `shop` qui assure l'isolation multi-tenant.

### 5.2 Schéma des tables

#### Authentification & Utilisateurs

```sql
-- Utilise Supabase Auth pour l'authentification
-- Table de profil étendu
profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id),
  first_name      TEXT NOT NULL,
  last_name       TEXT NOT NULL,
  avatar_url      TEXT,
  role            TEXT NOT NULL CHECK (role IN ('owner', 'employee')),
  shop_id         UUID REFERENCES shops(id),
  stripe_customer_id    TEXT,
  stripe_connect_id     TEXT,
  is_onboarded    BOOLEAN DEFAULT FALSE,
  onboarding_step INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
)
```

#### Magasin

```sql
shops (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,  -- URL path unique
  email           TEXT,
  phone           TEXT,
  address         TEXT,
  latitude        DOUBLE PRECISION,
  longitude       DOUBLE PRECISION,
  logo_url        TEXT,
  siret           TEXT,
  owner_id        UUID REFERENCES profiles(id) NOT NULL,
  stripe_connect_id     TEXT,
  stripe_subscription_id TEXT,
  subscription_active   BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
)

shop_availability (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id         UUID REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  opening_hour    TIME,
  closing_hour    TIME,
  season_start    DATE,
  season_end      DATE,
  monday          BOOLEAN DEFAULT TRUE,
  tuesday         BOOLEAN DEFAULT TRUE,
  wednesday       BOOLEAN DEFAULT TRUE,
  thursday        BOOLEAN DEFAULT TRUE,
  friday          BOOLEAN DEFAULT TRUE,
  saturday        BOOLEAN DEFAULT TRUE,
  sunday          BOOLEAN DEFAULT TRUE,
  UNIQUE(shop_id)
)

shop_closed_dates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id         UUID REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  closed_date     DATE NOT NULL,
  reason          TEXT,
  UNIQUE(shop_id, closed_date)
)
```

#### Catalogue -- Système d'attributs personnalisables

```sql
-- Catégories créées par le loueur (Ski alpin, VTT, Paddle, etc.)
categories (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id         UUID REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  name            TEXT NOT NULL,
  description     TEXT,
  image_url       TEXT,
  sort_order      INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(shop_id, name)
)

-- Attributs personnalisables définis par catégorie
-- Ex: Pour "Ski alpin" → "Taille (cm)" de type number, "Niveau" de type select
category_attributes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id     UUID REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
  name            TEXT NOT NULL,           -- "Taille", "Pointure", "Niveau"
  attribute_type  TEXT NOT NULL CHECK (attribute_type IN ('text', 'number', 'select')),
  options         JSONB,                   -- Pour type select : ["S","M","L","XL"] ou ["Débutant","Intermédiaire","Expert"]
  unit            TEXT,                    -- "cm", "kg", "pouces"
  is_required     BOOLEAN DEFAULT FALSE,
  applies_to      TEXT NOT NULL CHECK (applies_to IN ('product', 'participant')),
  -- 'product' = attribut sur le produit/unité (ex: taille du ski)
  -- 'participant' = info demandée au client (ex: poids, pointure)
  sort_order      INTEGER DEFAULT 0,
  UNIQUE(category_id, name)
)

-- Marques (partagées entre magasins)
brands (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT now()
)

shop_brands (
  shop_id         UUID REFERENCES shops(id) ON DELETE CASCADE,
  brand_id        UUID REFERENCES brands(id) ON DELETE CASCADE,
  PRIMARY KEY (shop_id, brand_id)
)

-- Produits (modèles)
products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id         UUID REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  category_id     UUID REFERENCES categories(id) NOT NULL,
  brand_id        UUID REFERENCES brands(id),
  name            TEXT NOT NULL,
  description     TEXT,
  image_url       TEXT,
  web_price       NUMERIC(10,2) NOT NULL,   -- Prix par jour en ligne
  shop_price      NUMERIC(10,2) NOT NULL,   -- Prix par jour en magasin
  is_active       BOOLEAN DEFAULT TRUE,
  attributes      JSONB DEFAULT '{}',       -- Valeurs des attributs "product"
  -- Ex: {"taille": "170", "niveau": "intermédiaire"}
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
)

-- Unités physiques (chaque pièce de matériel individuelle)
product_units (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  shop_id         UUID REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  barcode         TEXT,                     -- Code-barres / numéro de série
  condition       TEXT NOT NULL DEFAULT 'new'
                  CHECK (condition IN ('new', 'excellent', 'good', 'fair', 'poor')),
  status          TEXT NOT NULL DEFAULT 'available'
                  CHECK (status IN ('available', 'rented', 'maintenance', 'retired')),
  attributes      JSONB DEFAULT '{}',       -- Valeurs spécifiques à cette unité
  -- Ex: {"taille": "170"} (peut varier d'une unité à l'autre)
  last_used_at    TIMESTAMPTZ,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(shop_id, barcode)
)
```

#### Système de Packs

```sql
-- Packs créés par le loueur (ex: "Pack Ski Complet", "Pack VTT Sécurité")
packs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id         UUID REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  name            TEXT NOT NULL,
  description     TEXT,
  image_url       TEXT,
  category_id     UUID REFERENCES categories(id),  -- Catégorie principale
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
)

-- Produits inclus dans un pack
pack_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pack_id         UUID REFERENCES packs(id) ON DELETE CASCADE NOT NULL,
  product_id      UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  is_optional     BOOLEAN DEFAULT FALSE,    -- Produit optionnel ou obligatoire
  web_price       NUMERIC(10,2),            -- Prix spécifique au pack (override)
  shop_price      NUMERIC(10,2),            -- Prix spécifique au pack (override)
  sort_order      INTEGER DEFAULT 0
)
```

#### Promotions

```sql
promotions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id         UUID REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  code            TEXT NOT NULL,
  description     TEXT,
  discount_type   TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value  NUMERIC(10,2) NOT NULL,   -- % ou montant fixe
  min_amount      NUMERIC(10,2),            -- Montant minimum de commande
  max_uses        INTEGER,                  -- Nombre max d'utilisations
  used_count      INTEGER DEFAULT 0,
  start_date      DATE NOT NULL,
  end_date        DATE NOT NULL,
  is_active       BOOLEAN DEFAULT TRUE,
  -- Champs pour les promos générées par l'IA
  ai_generated    BOOLEAN DEFAULT FALSE,
  ai_reason       TEXT,                     -- Explication de la suggestion IA
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(shop_id, code)
)
```

#### Réservations

```sql
-- Clients finaux
clients (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id         UUID REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  first_name      TEXT NOT NULL,
  last_name       TEXT NOT NULL,
  email           TEXT NOT NULL,
  phone           TEXT,
  address         TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(shop_id, email)
)

-- Réservations
reservations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id         UUID REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  reference       TEXT NOT NULL,            -- Ref lisible (ex: RES-2026-001)
  client_id       UUID REFERENCES clients(id),
  start_date      DATE NOT NULL,
  end_date        DATE NOT NULL,
  arrival_time    TIME,
  status          TEXT NOT NULL DEFAULT 'draft'
                  CHECK (status IN (
                    'draft',        -- Panier en cours
                    'pending',      -- En attente de validation
                    'confirmed',    -- Confirmée (payée ou validée)
                    'ready',        -- Matériel prêt
                    'in_progress',  -- En cours de location
                    'completed',    -- Terminée
                    'cancelled'     -- Annulée
                  )),
  total_amount    NUMERIC(10,2) DEFAULT 0,
  discount_amount NUMERIC(10,2) DEFAULT 0,
  promotion_id    UUID REFERENCES promotions(id),
  is_paid         BOOLEAN DEFAULT FALSE,
  stripe_payment_intent_id  TEXT,
  stripe_charge_id          TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(shop_id, reference)
)

-- Participants (personnes qui utilisent le matériel)
participants (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id  UUID REFERENCES reservations(id) ON DELETE CASCADE NOT NULL,
  shop_id         UUID REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  first_name      TEXT NOT NULL,
  attributes      JSONB DEFAULT '{}',       -- Données morphologiques dynamiques
  -- Ex ski: {"poids": 75, "pointure": 42, "taille": 175}
  -- Ex VTT: {"taille": 180}
  -- Ex paddle: {"poids": 70}
  total_amount    NUMERIC(10,2) DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now()
)

-- Articles réservés (lien participant ↔ produit/pack)
reserved_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id  UUID REFERENCES reservations(id) ON DELETE CASCADE NOT NULL,
  participant_id  UUID REFERENCES participants(id) ON DELETE CASCADE NOT NULL,
  product_id      UUID REFERENCES products(id) NOT NULL,
  product_unit_id UUID REFERENCES product_units(id),  -- Assignation physique (optionnel au début)
  pack_id         UUID REFERENCES packs(id),           -- NULL si hors pack
  pack_item_id    UUID REFERENCES pack_items(id),      -- Référence au pack_item
  shop_id         UUID REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  start_date      DATE NOT NULL,
  end_date        DATE NOT NULL,
  price_per_day   NUMERIC(10,2) NOT NULL,
  total_price     NUMERIC(10,2) NOT NULL,
  is_pack_item    BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT now()
)
```

#### Paiements

```sql
-- Abonnements SaaS (loueur → Rentic)
subscriptions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id         UUID REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  user_id         UUID REFERENCES profiles(id) NOT NULL,
  stripe_subscription_id  TEXT NOT NULL,
  stripe_customer_id      TEXT NOT NULL,
  plan            TEXT NOT NULL CHECK (plan IN ('monthly', 'yearly')),
  amount          NUMERIC(10,2) NOT NULL,
  status          TEXT NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active', 'past_due', 'cancelled', 'trialing')),
  trial_ends_at   TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
)

-- Paiements d'abonnement
subscription_payments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE NOT NULL,
  shop_id         UUID REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  amount          NUMERIC(10,2) NOT NULL,
  stripe_invoice_id TEXT,
  stripe_charge_id  TEXT,
  invoice_url     TEXT,
  billing_reason  TEXT,
  paid_at         TIMESTAMPTZ DEFAULT now()
)

-- Paiements de réservation (client → loueur via Stripe Connect)
reservation_payments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id  UUID REFERENCES reservations(id) ON DELETE CASCADE NOT NULL,
  client_id       UUID REFERENCES clients(id),
  shop_id         UUID REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  amount          NUMERIC(10,2) NOT NULL,
  payment_type    TEXT NOT NULL CHECK (payment_type IN ('card', 'cash')),
  stripe_charge_id    TEXT,
  stripe_payment_intent_id TEXT,
  stripe_receipt_url  TEXT,
  invoice_url     TEXT,                     -- URL du PDF facture
  paid_at         TIMESTAMPTZ DEFAULT now()
)
```

#### Site Web Intégré (Landing Page)

```sql
landing_pages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id         UUID REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  -- Hero
  hero_title      TEXT DEFAULT 'Bienvenue',
  hero_subtitle   TEXT,
  hero_image_url  TEXT,
  -- À propos
  about_text      TEXT,
  about_image_url TEXT,
  -- Témoignages
  testimonials_image_url TEXT,
  -- SEO
  seo_description TEXT,
  og_image_url    TEXT,
  -- Réseaux sociaux
  facebook_url    TEXT,
  instagram_url   TEXT,
  google_url      TEXT,
  -- Pages légales
  terms_of_sale   TEXT,                     -- CGV
  terms_of_use    TEXT,                     -- CGU
  booking_terms   TEXT,                     -- Conditions de réservation
  -- Avantages activés (JSONB flexible)
  active_perks    JSONB DEFAULT '[]',
  -- Ex: [{"id": "early_pickup", "title": "Récupération la veille", "description": "..."}]
  UNIQUE(shop_id)
)

-- Avantages personnalisables (au lieu de 6 codés en dur)
shop_perks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id         UUID REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  title           TEXT NOT NULL,
  description     TEXT,
  icon            TEXT,                     -- Nom d'icône (ex: "clock", "shield", "percent")
  is_active       BOOLEAN DEFAULT TRUE,
  sort_order      INTEGER DEFAULT 0
)

-- Activités locales mises en avant
landing_activities (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id         UUID REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  title           TEXT NOT NULL,
  description     TEXT,
  image_url       TEXT,
  image_alt       TEXT,
  sort_order      INTEGER DEFAULT 0
)

-- Témoignages clients
landing_testimonials (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id         UUID REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  name            TEXT NOT NULL,
  review          TEXT NOT NULL,
  rating          INTEGER CHECK (rating BETWEEN 1 AND 5),
  sort_order      INTEGER DEFAULT 0
)
```

#### Assistant IA

```sql
-- Historique des conversations IA
ai_conversations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id         UUID REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  user_id         UUID REFERENCES profiles(id) NOT NULL,
  title           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
)

ai_messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES ai_conversations(id) ON DELETE CASCADE NOT NULL,
  role            TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content         TEXT NOT NULL,
  metadata        JSONB,                    -- Tool calls, données contextuelles
  created_at      TIMESTAMPTZ DEFAULT now()
)
```

### 5.3 Diagramme des relations

```
profiles ──────────────────┐
  │                        │ owner_id
  │ shop_id                ▼
  └──────────────────► shops ◄─── shop_availability
                         │   ◄─── shop_closed_dates
                         │   ◄─── landing_pages
                         │   ◄─── shop_perks
                         │   ◄─── landing_activities
                         │   ◄─── landing_testimonials
                         │   ◄─── subscriptions ◄── subscription_payments
                         │   ◄─── ai_conversations ◄── ai_messages
                         │
              ┌──────────┼──────────┐
              ▼          ▼          ▼
          categories   brands    promotions
              │       (via shop_brands)
              │
              ├── category_attributes
              │
              ▼
          products ◄──────────── pack_items ──────► packs
              │
              ▼
          product_units
              │
              │ (assignation)
              ▼
          reserved_items ──► participants ──► reservations ──► clients
                                                  │
                                                  ▼
                                          reservation_payments
```

---

## 6. Modules Fonctionnels

### 6.1 Auth & Onboarding

#### Inscription

- Email + mot de passe ou Google OAuth
- Vérification email obligatoire
- Saisie du numéro SIRET (validation format)

#### Onboarding (3 étapes)

| Étape | Champs | Description |
|-------|--------|-------------|
| 1. Mon profil | Photo, Prénom, Nom | Informations personnelles |
| 2. Mon magasin | Logo, Nom, Tél, Email, Adresse (geocoding), SIRET | Configuration boutique |
| 3. Mes horaires | Jours d'ouverture (toggles), heures, dates de saison | Disponibilités |

Après les 3 étapes → Sélection du plan d'abonnement → Stripe Checkout → Redirection vers le dashboard.

#### Rôles

| Rôle | Accès |
|------|-------|
| **Owner** | Tout (catalogue, réservations, packs, site web, paramètres, IA) |
| **Employee** | Dashboard, Réservations, Inventaire uniquement |

#### Connexion

- Email/password ou Google OAuth
- Mot de passe oublié avec reset par email
- Indicateur de force du mot de passe (longueur, chiffre, majuscule, minuscule, caractère spécial)

---

### 6.2 Gestion du Catalogue

#### Catégories

Le loueur crée ses propres catégories selon son activité :

```
Exemples ski :          Exemples VTT :        Exemples paddle :
├── Ski alpin           ├── VTT adulte        ├── Paddle rigide
├── Ski de fond         ├── VTT enfant        ├── Paddle gonflable
├── Snowboard           ├── VTT électrique    ├── Combinaison
├── Chaussures ski      ├── Casque            ├── Gilet de sécurité
├── Casque              ├── Protection        └── Pagaie
└── Bâtons              └── Remorque enfant
```

Pour chaque catégorie, le loueur définit des **attributs** :

- **Attributs produit** (`applies_to = 'product'`) : Caractéristiques du matériel (taille ski en cm, taille cadre VTT en S/M/L/XL, longueur paddle en ft)
- **Attributs participant** (`applies_to = 'participant'`) : Informations demandées au client lors de la réservation (poids, pointure, taille)

Types d'attributs supportés :
- `text` : Champ texte libre
- `number` : Valeur numérique (avec unité optionnelle : cm, kg, etc.)
- `select` : Liste de choix (ex: ["S", "M", "L", "XL"] ou ["Débutant", "Intermédiaire", "Expert"])

#### Produits

- Nom, description, image
- Catégorie (obligatoire)
- Marque (optionnelle, avec recherche/création à la volée)
- Prix par jour web / Prix par jour magasin (double tarification)
- Valeurs des attributs de la catégorie
- Statut actif/inactif

#### Unités physiques

Chaque produit possède N unités physiques individuellement traçables :

- Code-barres / numéro de série (unique par magasin)
- État : Neuf → Excellent → Bon → Correct → Usé
- Statut : Disponible / En location / Maintenance / Retiré
- Attributs spécifiques (ex: taille exacte si elle varie par unité)
- Date dernière utilisation
- Notes internes

#### Vues d'inventaire

1. **Vue stock global** : Tableau groupé par produit avec quantité totale, quantité disponible, filtres (catégorie, marque, recherche)
2. **Vue unités** : Tableau détaillé de chaque unité physique avec état/statut éditables inline, filtres avancés, scan code-barres

---

### 6.3 Système de Packs & Offres

#### Création de packs

Le loueur compose ses offres en assemblant des produits :

```
Pack "Ski Complet" (catégorie: Ski alpin)
├── [OBLIGATOIRE] Ski alpin         → prix pack web: 25€/j
├── [OBLIGATOIRE] Chaussures ski    → prix pack web: 12€/j
├── [OBLIGATOIRE] Bâtons            → prix pack web: 3€/j
├── [OPTIONNEL]   Casque            → prix pack web: 5€/j
└── Total obligatoire: 40€/j (vs 48€/j à l'unité = -17%)

Pack "VTT Sécurité" (catégorie: VTT)
├── [OBLIGATOIRE] VTT adulte        → prix pack web: 30€/j
├── [OBLIGATOIRE] Casque            → prix pack web: 0€/j (offert)
├── [OPTIONNEL]   Protection dorsale → prix pack web: 5€/j
└── Total obligatoire: 30€/j
```

**Fonctionnalités** :
- Nom, description, image, catégorie principale
- Ajout de produits avec marquage obligatoire/optionnel
- Prix spécifiques au pack (override des prix unitaires)
- Affichage de l'économie réalisée vs achat séparé
- Activation/désactivation du pack

#### Promotions

- Code promo avec pourcentage ou montant fixe
- Dates de validité (début/fin)
- Montant minimum de commande (optionnel)
- Nombre maximum d'utilisations (optionnel)
- Compteur d'utilisations

**Promotions générées par l'IA** (voir section 6.9) :
- L'IA analyse le stock sous-utilisé et suggère des promos
- Le loueur valide/modifie avant publication
- Marquage `ai_generated` + `ai_reason` pour traçabilité

---

### 6.4 Réservations

#### Parcours client (front-office)

1. **Choix des dates** : Date picker sur la page shop du loueur
2. **Sélection du matériel** : Toggle Packs / Produits individuels, filtrage par catégorie (onglets)
3. **Panier** :
   - Liste des participants avec saisie des attributs dynamiques (taille, poids, pointure, etc. selon la catégorie)
   - Récapitulatif des prix
   - Code promo
   - Heure d'arrivée
4. **Paiement** : Stripe Checkout (mode payment, via Connect)
5. **Confirmation** : Email avec reçu + facture PDF

#### Gestion back-office (loueur)

CRUD en 4 onglets :

| Onglet | Contenu |
|--------|---------|
| **1. Client** | Prénom, nom, email, tél, adresse, heure d'arrivée |
| **2. Participants** | Tableau des participants avec attributs dynamiques + matériel assigné |
| **3. Matériel** | Attribution d'unités physiques (scan code-barres), changement de statut |
| **4. Encaissement** | Récapitulatif, code promo, paiement CB/espèces, facture, clôture |

#### Cycle de vie des réservations

```
draft → pending → confirmed → ready → in_progress → completed
                     │                                    │
                     └──────────► cancelled ◄─────────────┘
```

| Statut | Description | Déclencheur |
|--------|-------------|------------|
| `draft` | Panier en cours côté client | Ajout au panier |
| `pending` | En attente de validation/paiement | Soumission du panier |
| `confirmed` | Payée ou validée manuellement | Paiement Stripe ou validation loueur |
| `ready` | Matériel préparé | Loueur marque "prêt" |
| `in_progress` | Client a récupéré le matériel | Loueur marque "distribué" |
| `completed` | Location terminée, matériel rendu | Loueur marque "terminé" |
| `cancelled` | Annulée | Loueur ou client annule |

#### Calcul de disponibilité

Pour une période donnée (start_date → end_date), la disponibilité d'un produit est :

```sql
-- Unités disponibles = Total unités actives - Unités déjà réservées sur la période
SELECT COUNT(*) FROM product_units pu
WHERE pu.product_id = {product_id}
  AND pu.status = 'available'
  AND pu.id NOT IN (
    SELECT ri.product_unit_id FROM reserved_items ri
    JOIN reservations r ON r.id = ri.reservation_id
    WHERE ri.product_id = {product_id}
      AND ri.product_unit_id IS NOT NULL
      AND r.status NOT IN ('draft', 'cancelled', 'completed')
      AND ri.start_date < {end_date}
      AND ri.end_date > {start_date}
  )
```

---

### 6.5 Paiements & Facturation

#### Double flux Stripe

| Flux | Mode | De → Vers | Déclencheur |
|------|------|-----------|------------|
| **Abonnement SaaS** | Subscription | Loueur → Rentic | Onboarding / renouvellement |
| **Paiement réservation** | Payment (Connect Express) | Client → Loueur | Validation panier |

#### Plans d'abonnement

| Plan | Prix | Intervalle | Avantage |
|------|------|-----------|----------|
| Mensuel | 79€ | Mois | Sans engagement |
| Annuel | 790€ | An | 2 mois offerts |

Période d'essai : 1 mois gratuit pour les deux plans.

#### Webhooks Stripe à implémenter

| Événement | Action |
|-----------|--------|
| `checkout.session.completed` (subscription) | Créer Subscription, activer shop |
| `invoice.paid` | Enregistrer subscription_payment |
| `customer.subscription.updated` | MAJ plan |
| `customer.subscription.deleted` | Désactiver shop |
| `customer.subscription.trial_will_end` | Email notification |
| `checkout.session.completed` (Connect) | MAJ réservation, créer client, générer facture |

#### Facturation

- Génération PDF automatique après paiement
- Contient : infos loueur (SIRET), infos client, détail par participant, totaux
- Envoi par email au client
- Téléchargeable depuis le back-office

#### Paiement en espèces

Le loueur peut enregistrer un paiement en espèces depuis le back-office (onglet Encaissement du CRUD réservation).

---

### 6.6 Site Web Intégré

Chaque loueur dispose d'un site web public accessible via `/s/{shop-slug}`.

#### Sections de la landing page

| # | Section | Contenu | Personnalisable |
|---|---------|---------|----------------|
| 1 | **Topbar** | Logo, navigation (ancres), bouton réservation | Logo via shop |
| 2 | **Hero** | Titre, sous-titre, image de fond, date picker + CTA | Oui (3 champs) |
| 3 | **Équipement** | Grille des catégories avec images | Auto (depuis catégories) |
| 4 | **Avantages** | Liste d'avantages avec icônes | Oui (shop_perks, flexible) |
| 5 | **Témoignages** | Avis clients avec étoiles | Oui (landing_testimonials) |
| 6 | **Activités** | Activités locales en cartes | Oui (landing_activities) |
| 7 | **À propos** | Texte + image de l'équipe | Oui (2 champs) |
| 8 | **Carte** | Google Maps avec localisation | Auto (depuis adresse shop) |
| 9 | **Footer** | Coordonnées, réseaux sociaux, liens légaux | Auto + liens sociaux |

#### Website Builder (back-office)

Interface WYSIWYG avec prévisualisation en direct, 8 onglets :

1. **Header** : Titre, sous-titre, image hero
2. **Catégories** : Gestion des catégories affichées (image, nom, description)
3. **Avantages** : Création/édition/activation d'avantages personnalisés (titre, description, icône)
4. **Avis** : Gestion des témoignages (nom, note, texte) + image de fond
5. **Activités** : Gestion des activités locales (image, titre, description)
6. **L'équipe** : Texte "à propos" + image
7. **Pages légales** : Éditeurs rich text (CGV, CGU, Conditions de réservation)
8. **SEO** : Meta description, image Open Graph, liens réseaux sociaux

**Point clé** : Les avantages ne sont plus codés en dur. Le loueur crée ses propres avantages avec titre, description et icône. On peut fournir des templates par type d'activité (ski, VTT, surf) au moment de l'onboarding pour faciliter la mise en route.

---

### 6.7 Dashboard & Analytics

#### Métriques principales (4 cartes)

| Métrique | Calcul |
|----------|--------|
| Locations cette saison | Nombre de réservations completed |
| Réservations en cours | Nombre de réservations confirmed + ready + in_progress |
| Chiffre d'affaires | Somme des reservation_payments sur la période |
| Promos actives | Nombre de promotions en cours de validité |

#### Graphique

Réservations par période (semaine, mois, saison) avec vue Line/Bar chart.

#### Compteurs de statut (cliquables)

4 badges : À venir, Prêtes, En cours, Terminées → clic redirige vers la liste filtrée.

#### Tableau des réservations récentes

Colonnes : Référence, Client, Dates, Statut (badge coloré), Montant, Action (voir détail).

---

### 6.8 Paramètres & Équipe

#### Informations du magasin

- Compte Stripe Connect (création/lien vers dashboard Express)
- Infos générales : Logo, Nom, Tél, Email, Adresse (geocoding), SIRET
- Disponibilités : Heures, jours, dates de saison, dates fermées

#### Gestion des employés

- Tableau des employés (nom, email, date création, rôle)
- Invitation par email (crée un compte avec rôle Employee)
- Suppression d'employé

#### Abonnement

- Plan actuel avec prix et dates
- Lien vers le portail Stripe (changement de plan, annulation)
- Historique des factures avec téléchargement

#### Profil utilisateur

- Photo, prénom, nom
- Changement d'email (avec vérification)
- Déconnexion

---

### 6.9 Assistant IA

L'assistant IA est un **chat intégré** dans le dashboard, connecté aux données du magasin via le tool use de Claude.

#### Outils disponibles pour l'IA

| Tool | Description |
|------|-------------|
| `get_stock_overview` | Vue d'ensemble du stock (par catégorie, disponibilité, état) |
| `get_product_availability` | Disponibilité d'un produit sur une période |
| `get_reservation_stats` | Statistiques des réservations (période, montants, statuts) |
| `get_low_performers` | Produits les moins loués sur une période |
| `get_seasonal_trends` | Tendances de réservation (jours de la semaine, périodes) |
| `suggest_promotion` | Génère une suggestion de promo (le loueur valide) |
| `create_promotion` | Crée une promo après validation du loueur |

#### Cas d'usage

1. **Analyse du stock** :
   > "Quel est l'état de mon stock ?"
   > → L'IA analyse et résume : X unités disponibles, Y en maintenance, Z les plus louées

2. **Suggestions de promos** :
   > "Quels articles devrais-je mettre en promo ?"
   > → L'IA identifie les produits sous-performants et suggère des promos adaptées

3. **Optimisation tarifaire** :
   > "Est-ce que mes prix sont cohérents pour la haute saison ?"
   > → L'IA compare les taux de remplissage et suggère des ajustements

4. **Aide à la décision** :
   > "J'envisage d'acheter 5 VTT électriques, c'est pertinent ?"
   > → L'IA analyse la demande passée, le taux de remplissage des VTT existants

5. **Génération d'offres** :
   > "Crée une promo pour les paddles en milieu de semaine"
   > → L'IA propose un code, un pourcentage, des dates, et le loueur valide avant publication

---

## 7. Architecture Technique

### 7.1 Stack

| Couche | Technologie | Rôle |
|--------|------------|------|
| **Frontend** | Next.js 15 (App Router) + React 19 | SSR/SSG, routing, API routes |
| **UI** | shadcn/ui + Tailwind CSS v4 | Composants + design system |
| **Base de données** | Supabase (PostgreSQL) | Données, RLS, Realtime |
| **Auth** | Supabase Auth | Email/password, Google OAuth, magic links |
| **Storage** | Supabase Storage | Images (logos, produits, landing), factures PDF |
| **Paiements** | Stripe | Connect Express + Subscriptions + Webhooks |
| **Emails** | Resend | Emails transactionnels (confirmation, factures, invitations) |
| **PDF** | @react-pdf/renderer | Génération de factures |
| **IA** | Claude API (Anthropic SDK) | Assistant avec tool use |
| **Charts** | Recharts | Graphiques du dashboard |
| **Maps** | Leaflet + OpenStreetMap | Carte de localisation (gratuit) |
| **Hosting** | Vercel | Déploiement, edge functions, analytics |
| **Monitoring** | Sentry | Erreurs et performance |

### 7.2 Structure du projet

```
src/
├── app/
│   ├── (marketing)/              # Site Rentic
│   │   ├── page.tsx              # Landing page
│   │   ├── confidentialite/
│   │   └── mentions-legales/
│   │
│   ├── (auth)/                   # Authentification
│   │   ├── sign-in/
│   │   ├── sign-up/
│   │   ├── reset-password/
│   │   ├── email-confirmed/
│   │   └── onboarding/
│   │
│   ├── app/                      # Dashboard loueur (protégé)
│   │   ├── layout.tsx            # Sidebar + topbar
│   │   ├── page.tsx              # Dashboard
│   │   ├── reservations/
│   │   │   ├── page.tsx          # Liste
│   │   │   └── [id]/page.tsx     # CRUD détail
│   │   ├── inventory/
│   │   │   ├── products/         # Stock global
│   │   │   └── units/            # Unités physiques
│   │   ├── packs/
│   │   │   ├── page.tsx          # Liste des packs
│   │   │   └── [id]/page.tsx     # Détail pack
│   │   ├── pricing/
│   │   │   ├── page.tsx          # Prix des modèles
│   │   │   └── promotions/       # Promos
│   │   ├── website/              # Website builder
│   │   ├── settings/
│   │   │   ├── shop/             # Infos magasin
│   │   │   ├── team/             # Employés
│   │   │   └── billing/          # Abonnement
│   │   └── assistant/            # Chat IA
│   │
│   ├── s/[slug]/                 # Site public du loueur
│   │   ├── page.tsx              # Landing page
│   │   └── legal/                # Pages légales
│   │
│   ├── r/[slug]/                 # Réservation client
│   │   ├── page.tsx              # Sélection matériel
│   │   └── confirmation/         # Post-paiement
│   │
│   └── api/
│       ├── webhooks/
│       │   └── stripe/           # Webhooks Stripe
│       ├── ai/
│       │   └── chat/             # Endpoint IA
│       └── invoices/
│           └── generate/         # Génération PDF
│
├── components/
│   ├── ui/                       # shadcn/ui
│   ├── marketing/                # Composants site Rentic
│   ├── app/                      # Composants dashboard
│   │   ├── sidebar.tsx
│   │   ├── reservation-crud.tsx
│   │   ├── inventory-table.tsx
│   │   ├── pack-editor.tsx
│   │   └── website-builder.tsx
│   └── storefront/               # Composants site loueur
│       ├── hero.tsx
│       ├── equipment-grid.tsx
│       ├── testimonials.tsx
│       └── booking-cart.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   ├── middleware.ts
│   │   └── types.ts              # Types générés
│   ├── stripe/
│   │   ├── client.ts
│   │   ├── webhooks.ts
│   │   └── connect.ts
│   ├── ai/
│   │   ├── client.ts
│   │   └── tools.ts              # Tool definitions
│   └── utils/
│       ├── availability.ts       # Calcul disponibilité
│       ├── pricing.ts            # Calcul prix
│       └── invoice.ts            # Génération facture
│
└── supabase/
    ├── migrations/               # Migrations SQL
    └── seed.sql                  # Données de test
```

### 7.3 Routing

| Route | Description | Auth |
|-------|------------|------|
| `/` | Landing page Rentic | Non |
| `/sign-in`, `/sign-up` | Authentification | Non |
| `/onboarding` | Setup initial | Oui (owner) |
| `/app` | Dashboard | Oui (owner/employee) |
| `/app/reservations` | Gestion réservations | Oui |
| `/app/inventory/*` | Gestion inventaire | Oui |
| `/app/packs` | Gestion packs | Oui (owner) |
| `/app/pricing/*` | Prix et promos | Oui (owner) |
| `/app/website` | Website builder | Oui (owner) |
| `/app/settings/*` | Paramètres | Oui (owner) |
| `/app/assistant` | Chat IA | Oui (owner) |
| `/s/{slug}` | Site public loueur | Non |
| `/r/{slug}` | Réservation client | Non |
| `/api/webhooks/stripe` | Webhooks | Stripe signature |

---

## 8. Sécurité & Permissions

### Row Level Security (RLS)

Toutes les tables sont protégées par RLS. Principe : un utilisateur ne voit que les données de son shop.

```sql
-- Exemple de politique RLS sur products
CREATE POLICY "Users can view products of their shop"
  ON products FOR SELECT
  USING (shop_id IN (
    SELECT shop_id FROM profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Owners can manage products"
  ON products FOR ALL
  USING (shop_id IN (
    SELECT shop_id FROM profiles
    WHERE id = auth.uid() AND role = 'owner'
  ));

-- Données publiques (site du loueur)
CREATE POLICY "Public can view active products"
  ON products FOR SELECT
  USING (is_active = TRUE);
```

### Sécurité des webhooks Stripe

- Vérification de la signature Stripe (`stripe.webhooks.constructEvent`)
- Pas de liste blanche IP (la signature suffit et est plus fiable)

### Sécurité générale

- CSRF protection via Next.js
- Validation des inputs côté serveur (zod)
- Rate limiting sur les API publiques
- Headers de sécurité (CSP, HSTS, etc.)
- Sanitisation des contenus rich text (DOMPurify)

---

## 9. Roadmap

### Phase 1 -- MVP Core (8-10 semaines)

**Objectif** : Un loueur peut s'inscrire, configurer son magasin, ajouter son catalogue et recevoir des réservations en ligne.

- [ ] Auth (inscription, connexion, Google OAuth)
- [ ] Onboarding 3 étapes
- [ ] Gestion des catégories avec attributs personnalisables
- [ ] Gestion des produits
- [ ] Gestion des unités physiques
- [ ] Gestion des marques
- [ ] Site web intégré (landing page builder)
- [ ] Page de réservation client (sélection matériel + panier)
- [ ] Intégration Stripe Connect (paiement réservation)
- [ ] Intégration Stripe Subscriptions (abonnement SaaS)
- [ ] Gestion des réservations (liste + CRUD 4 onglets)
- [ ] Dashboard avec métriques de base
- [ ] Facturation PDF
- [ ] Emails transactionnels (confirmation, facture)

### Phase 2 -- Packs & Offres (3-4 semaines)

- [ ] Système de packs (création, produits obligatoires/optionnels)
- [ ] Promotions (codes promo avec dates, limites)
- [ ] Application de promo dans le tunnel de réservation
- [ ] Vue "Packs" dans le tunnel client
- [ ] Gestion des prix des modèles (tableau éditable)

### Phase 3 -- Intelligence (3-4 semaines)

- [ ] Assistant IA (chat intégré)
- [ ] Outils IA : analyse stock, stats réservations, tendances
- [ ] Suggestions de promos par l'IA
- [ ] Création de promos validée par le loueur
- [ ] Templates d'avantages par secteur (ski, VTT, nautique)

### Phase 4 -- Polish & Scale (continu)

- [ ] Notifications push / SMS
- [ ] Mode hors-ligne pour la gestion en magasin
- [ ] Multi-langue (FR/EN)
- [ ] App mobile (PWA ou React Native)
- [ ] API publique pour intégrations tierces
- [ ] Tarifs dégressifs (semaine, saison)
- [ ] Système de caution
- [ ] Signature électronique des conditions de location
- [ ] Export comptable

---

## 10. Métriques de Succès

### KPIs Produit

| Métrique | Cible | Mesure |
|----------|-------|--------|
| Temps d'onboarding | < 15 min | Analytics |
| Taux de complétion onboarding | > 80% | Funnel |
| Réservations en ligne / total | > 40% après 3 mois | Dashboard |
| Taux de double-booking | 0% | Monitoring |
| NPS loueurs | > 50 | Enquêtes |

### KPIs Business

| Métrique | Cible Y1 |
|----------|----------|
| Nombre de loueurs actifs | 50 |
| MRR | 5 000€ |
| Churn mensuel | < 5% |
| CAC (Coût d'acquisition client) | < 200€ |
| LTV / CAC | > 3 |

### KPIs Techniques

| Métrique | Cible |
|----------|-------|
| Temps de chargement (LCP) | < 2s |
| Uptime | 99.9% |
| Temps de réponse API | < 500ms (p95) |
| Score Lighthouse | > 90 |
