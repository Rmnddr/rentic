---
stepsCompleted: [1, 2, 3, 4]
status: 'complete'
completedAt: '2026-03-16'
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
---

# Rentic - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Rentic, decomposing the requirements from the PRD, UX Design, and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

- FR1: Un loueur peut créer un compte avec email et mot de passe
- FR2: Un loueur peut compléter un onboarding guidé (profil, magasin, première catégorie)
- FR3: Un loueur (owner) peut inviter un employé par email
- FR4: Un employé peut accéder aux sections autorisées selon son rôle (dashboard, réservations, inventaire)
- FR5: Un loueur (owner) peut gérer les comptes employés (créer, désactiver)
- FR6: Le système restreint l'accès aux fonctions sensibles (prix, site web, paramètres, abonnement) aux owners uniquement
- FR7: Un loueur peut créer, modifier et supprimer des catégories de produits
- FR8: Un loueur peut définir des attributs personnalisés par catégorie (type produit ou participant, format texte/nombre/select)
- FR9: Un loueur peut créer, modifier et supprimer des produits avec prix web et prix magasin
- FR10: Un loueur peut gérer les unités physiques (stock unitaire) de chaque produit
- FR11: Un loueur peut gérer une liste de marques et les associer à ses produits
- FR12: Le système met à jour la disponibilité du stock en < 5s après chaque changement de réservation
- FR13: Un loueur peut créer, modifier et supprimer des packs composés de plusieurs produits
- FR14: Un loueur peut définir des produits obligatoires et optionnels dans un pack
- FR15: Un loueur peut définir des prix spécifiques (web/magasin) pour les items d'un pack, différents du prix unitaire
- FR16: Un client peut sélectionner des dates de location, puis consulter les produits et packs disponibles sur cette période
- FR17: Le système calcule et affiche la disponibilité des produits en temps réel en fonction des dates sélectionnées et du stock unitaire
- FR18: Un client peut sélectionner un pack dans le tunnel de réservation et activer ou désactiver les produits optionnels du pack
- FR19: Un employé ou owner peut créer une réservation manuelle depuis le back-office
- FR20: Un employé ou owner peut consulter les réservations selon 4 vues (à venir, en cours, passées, annulées)
- FR21: Un employé ou owner peut modifier le statut d'une réservation (confirmer, démarrer, terminer, annuler)
- FR22: Le système collecte les attributs participants dynamiques (définis par catégorie) lors de la réservation
- FR23: Le système empêche les double-bookings sur les unités physiques
- FR24: Un client reçoit une confirmation de réservation par email avec facture PDF
- FR25: Un loueur peut configurer et publier un site web (landing page avec hero, sections personnalisables, informations magasin)
- FR26: Le site web du loueur affiche le catalogue avec catégories, produits, packs et prix
- FR27: Le site web intègre un tunnel de réservation complet (dates → disponibilité → sélection → participants → paiement)
- FR28: Chaque site de loueur est accessible via une URL publique unique basée sur un identifiant texte (slug)
- FR29: Le site web s'adapte aux écrans de 320px à 1440px (responsive)
- FR30: Le loueur peut configurer ses CGV/CGU affichées sur son site
- FR31: Un client peut payer une réservation en ligne par carte bancaire via le processeur de paiement intégré
- FR32: Un employé ou owner peut enregistrer un paiement en espèces pour une réservation sur place
- FR33: Les paiements clients sont versés sur le compte marchand dédié du loueur
- FR34: Le système génère automatiquement une facture PDF conforme (mentions légales, SIRET, TVA)
- FR35: Le système envoie les emails transactionnels (confirmation, facture, invitation employé)
- FR36: Un loueur peut souscrire à un plan d'abonnement (Saison 450€ ou Annuel 790€)
- FR37: Un loueur bénéficie d'un mois d'essai gratuit à l'inscription
- FR38: Le système gère le cycle de vie de l'abonnement (essai → actif → impayé → annulé)
- FR39: Un loueur peut consulter et gérer son abonnement (plan actuel, facturation, annulation)
- FR40: Le système affiche un bandeau d'alerte et bloque la création de nouvelles réservations en ligne si l'abonnement est inactif
- FR41: Un loueur peut consulter un tableau de bord avec les métriques clés (réservations du jour, CA, taux d'occupation)
- FR42: Un employé peut consulter le tableau de bord des réservations du jour
- FR43: Le système affiche les réservations des 7 prochains jours avec les détails participants pour la préparation du matériel
- FR44: L'admin Rentic peut suivre les abonnements actifs, le MRR, les essais en cours et les churns via le tableau de bord de gestion des paiements
- FR45: Le système synchronise l'état des abonnements avec le provider de facturation en < 60s via webhooks
- FR46: L'admin peut identifier les abandons d'onboarding (profils non complétés)
- FR47: Le système journalise les erreurs applicatives avec stack trace, identifiant utilisateur et shop_id pour le diagnostic opérationnel

### NonFunctional Requirements

- NFR1: Les pages publiques du loueur (landing + catalogue) se chargent en < 2s (LCP) grâce au cache statique et CDN
- NFR2: Le tunnel de réservation répond en < 500ms à chaque étape (calcul dispo, ajout panier, paiement)
- NFR3: Les actions dashboard (lister réservations, mettre à jour statut) s'exécutent en < 1s (p95)
- NFR4: Le système supporte 50 réservations simultanées par loueur en période de pointe avec un temps de réponse < 2x le p95 nominal
- NFR5: Isolation complète des données entre loueurs via Row Level Security — aucune fuite de données cross-tenant
- NFR6: Aucune donnée de carte bancaire ne transite ou n'est stockée côté serveur (conformité PCI-DSS déléguée au processeur de paiement)
- NFR7: Tous les webhooks entrants sont vérifiés par signature cryptographique avant traitement
- NFR8: Les données personnelles (clients, participants) sont protégées conformément au RGPD (consentement, droit à l'effacement, chiffrement en transit)
- NFR9: Les sessions authentifiées expirent après 30 minutes d'inactivité et les tokens sont gérés côté serveur
- NFR10: L'architecture supporte jusqu'à 200 loueurs actifs sans changement d'infrastructure
- NFR11: Les pages publiques absorbent les pics saisonniers via le cache CDN sans surcoût significatif (objectif : 95% de requêtes servies depuis le cache)
- NFR12: La base de données supporte la croissance du stock et des réservations avec des index appropriés (p95 < 200ms jusqu'à 100K réservations)
- NFR13: Uptime de 99.9% (< 9h de downtime par an)
- NFR14: 100% des paiements en ligne sont réconciliés — aucune perte de transaction
- NFR15: Les webhooks de paiement gèrent les retries et l'idempotence (pas de double traitement)
- NFR16: Backups automatiques quotidiens de la base de données avec RPO < 24h et RTO < 1h
- NFR17: Les intégrations de paiement tolèrent les indisponibilités temporaires du provider (retry 3x avec backoff exponentiel, tolérance max 1h)
- NFR18: Les emails transactionnels sont envoyés en < 30s après l'événement déclencheur
- NFR19: Le monitoring applicatif capture 100% des erreurs non gérées avec contexte suffisant pour le diagnostic (stack trace, user, shop_id)
- NFR20: Les sites publics des loueurs atteignent un score Lighthouse > 90 en desktop et > 85 en mobile (performance, SEO, accessibilité)
- NFR21: Le tunnel de réservation est utilisable sur mobile dès 320px de large avec des cibles tactiles ≥ 44x44px
- NFR22: Les pages publiques sont indexables par les moteurs de recherche (rendu serveur, meta tags, sitemap) avec indexation effective < 7 jours après publication

### Additional Requirements

**Depuis l'Architecture :**

- Starter template : Official Supabase Next.js Starter (`npx create-next-app -e with-supabase`) + `npx shadcn@latest init` — doit être la première story
- Next.js 16.1 (upgrade depuis PRD qui mentionnait 15)
- Architecture EAV pour les attributs dynamiques (tables `category_attributes`, `product_attribute_values`, `participant_attribute_values`)
- TanStack Query v5 pour le state management interactif du dashboard
- React Hook Form + Zod pour la validation formulaires
- Structure par feature (`features/`) avec tests co-localisés
- Supabase Realtime pour les mises à jour temps réel des réservations
- Double flux Stripe webhooks (Subscriptions + Connect) avec idempotence
- Pattern `ActionResult<T>` pour toutes les Server Actions
- Pattern hybride Server Actions (mutations) + API Routes (webhooks, endpoints publics)
- Supabase migrations versionées dans git
- Sentry avec contexte shop_id + user sur toutes les routes
- Feature boundaries : pas d'import cross-feature

**Depuis l'UX Design :**

- Toggle Vue Réservations ↔ Vue Matériel (innovation UX clé)
- Drawer à droite pour la personnalisation d'équipement dans le tunnel
- Pattern browse + add to cart (pas un wizard linéaire) pour le tunnel
- Direction "Soft Rounded" : radius 16px, fond lavande (#F8F7FF), ombres douces
- Font Bricolage Grotesque (variable, 200-800)
- Palette : bleu indigo primary (~#5B6CF0) + accent amber (#F59E0B)
- WCAG 2.1 AA obligatoire
- Responsive par audience : desktop dashboard, mobile simplifié "Aujourd'hui", mobile-first tunnel
- Toast discret en bas à droite pour les feedbacks
- Empty states illustrés pour guider les nouveaux utilisateurs
- Skeleton loading pour les chargements initiaux
- Sidebar flottante avec navigation par rôle

### FR Coverage Map

| FR | Description | Epic |
|----|-------------|------|
| FR1 | Création de compte email/mot de passe | Epic 1 |
| FR2 | Onboarding guidé (profil, magasin, première catégorie) | Epic 2 |
| FR3 | Invitation employé par email | Epic 8 |
| FR4 | Accès employé par rôle | Epic 8 |
| FR5 | Gestion comptes employés | Epic 8 |
| FR6 | Restriction accès fonctions sensibles aux owners | Epic 1 |
| FR7 | CRUD catégories produits | Epic 2 |
| FR8 | Attributs personnalisés par catégorie (EAV) | Epic 2 |
| FR9 | CRUD produits avec prix web/magasin | Epic 2 |
| FR10 | Gestion unités physiques (stock unitaire) | Epic 2 |
| FR11 | Gestion marques | Epic 2 |
| FR12 | Mise à jour disponibilité stock < 5s | Epic 2 |
| FR13 | CRUD packs multi-produits | Epic 3 |
| FR14 | Produits obligatoires/optionnels dans un pack | Epic 3 |
| FR15 | Prix spécifiques web/magasin par item de pack | Epic 3 |
| FR16 | Sélection dates + consultation disponibilité | Epic 5 |
| FR17 | Calcul disponibilité temps réel | Epic 5 |
| FR18 | Sélection pack + toggle optionnels dans tunnel | Epic 5 |
| FR19 | Réservation manuelle back-office | Epic 4 |
| FR20 | Vues réservations (à venir, en cours, passées, annulées) | Epic 4 |
| FR21 | Modification statut réservation | Epic 4 |
| FR22 | Collecte attributs participants dynamiques | Epic 4 |
| FR23 | Prévention double-booking | Epic 4 |
| FR24 | Email confirmation + facture PDF | Epic 6 |
| FR25 | Configuration site web (landing page, hero, sections) | Epic 5 |
| FR26 | Affichage catalogue sur site public | Epic 5 |
| FR27 | Tunnel de réservation complet sur site | Epic 5 |
| FR28 | URL publique unique (slug) | Epic 5 |
| FR29 | Responsive 320px–1440px | Epic 5 |
| FR30 | Configuration CGV/CGU | Epic 5 |
| FR31 | Paiement en ligne par carte bancaire | Epic 6 |
| FR32 | Paiement en espèces back-office | Epic 6 |
| FR33 | Versement sur compte marchand dédié | Epic 6 |
| FR34 | Génération facture PDF conforme | Epic 6 |
| FR35 | Emails transactionnels | Epic 6 |
| FR36 | Souscription plan d'abonnement | Epic 7 |
| FR37 | Mois d'essai gratuit | Epic 7 |
| FR38 | Cycle de vie abonnement | Epic 7 |
| FR39 | Consultation/gestion abonnement | Epic 7 |
| FR40 | Bandeau alerte + blocage si abonnement inactif | Epic 7 |
| FR41 | Dashboard métriques clés (CA, taux occupation) | Epic 8 |
| FR42 | Dashboard réservations du jour (employé) | Epic 8 |
| FR43 | Réservations 7 prochains jours + détails participants | Epic 8 |
| FR44 | Dashboard admin (abonnements, MRR, churn) | Epic 9 |
| FR45 | Synchronisation abonnements via webhooks < 60s | Epic 9 |
| FR46 | Identification abandons d'onboarding | Epic 9 |
| FR47 | Journalisation erreurs avec contexte | Epic 9 |

**Couverture : 47/47 FRs (100%)**

## Epic List

### Epic 1 : Foundation, Auth & Accès
- **Objectif :** Mettre en place le projet (starter template, design system, DB fondation), l'authentification et le système de rôles owner/employee.
- **FRs :** FR1, FR6
- **NFRs clés :** NFR5 (RLS multi-tenant), NFR9 (session expiry), NFR10 (200 loueurs)
- **Additionnel :** Starter template Supabase + shadcn/ui, ActionResult<T>, structure feature-based, Sentry setup
- **Dépendances :** Aucune (point de départ)

### Epic 2 : Onboarding & Catalogue
- **Objectif :** Permettre au loueur de compléter l'onboarding et de gérer son catalogue complet (catégories, attributs EAV, produits, unités, marques, disponibilité).
- **FRs :** FR2, FR7, FR8, FR9, FR10, FR11, FR12
- **NFRs clés :** NFR12 (index DB 100K réservations)
- **Additionnel :** Architecture EAV (category_attributes, product_attribute_values), empty states illustrés
- **Dépendances :** Epic 1

### Epic 3 : Packs & Tarification
- **Objectif :** Permettre au loueur de créer des packs composés de produits avec gestion obligatoire/optionnel et tarification spécifique.
- **FRs :** FR13, FR14, FR15
- **Dépendances :** Epic 2

### Epic 4 : Gestion des Réservations Back-office
- **Objectif :** Permettre la création manuelle, la consultation (4 vues), la gestion des statuts, la collecte d'attributs participants et la prévention des double-bookings.
- **FRs :** FR19, FR20, FR21, FR22, FR23
- **NFRs clés :** NFR3 (actions < 1s p95), NFR4 (50 réservations simultanées)
- **Additionnel :** Toggle Vue Réservations ↔ Vue Matériel, Supabase Realtime, participant_attribute_values (EAV)
- **Dépendances :** Epic 2 (produits nécessaires), Epic 3 (packs optionnel mais recommandé)

### Epic 5 : Site Web & Tunnel de Réservation
- **Objectif :** Permettre au loueur de configurer et publier son site web public avec catalogue, et intégrer le tunnel de réservation complet pour les clients.
- **FRs :** FR16, FR17, FR18, FR25, FR26, FR27, FR28, FR29, FR30
- **NFRs clés :** NFR1 (LCP < 2s), NFR2 (tunnel < 500ms), NFR11 (CDN 95%), NFR20 (Lighthouse > 90), NFR21 (mobile 320px), NFR22 (SEO)
- **Additionnel :** ISR + CDN, Bricolage Grotesque font, design Soft Rounded, drawer personnalisation, pattern browse + add to cart
- **Dépendances :** Epic 2 (catalogue), Epic 3 (packs), Epic 4 (moteur réservation)

### Epic 6 : Paiements & Facturation
- **Objectif :** Intégrer les paiements en ligne (Stripe Connect) et espèces, la génération de factures PDF conformes et les emails transactionnels.
- **FRs :** FR24, FR31, FR32, FR33, FR34, FR35
- **NFRs clés :** NFR6 (PCI-DSS), NFR7 (webhooks signature), NFR14 (réconciliation 100%), NFR15 (idempotence), NFR17 (retry backoff), NFR18 (emails < 30s)
- **Additionnel :** Stripe Connect Express, webhooks Connect, Resend emails, facture PDF conforme (SIRET, TVA)
- **Dépendances :** Epic 4 (réservations), Epic 5 (tunnel pour paiement en ligne)

### Epic 7 : Abonnement SaaS
- **Objectif :** Gérer le cycle de vie des abonnements loueurs (essai, souscription, facturation, annulation) et le blocage en cas d'impayé.
- **FRs :** FR36, FR37, FR38, FR39, FR40
- **NFRs clés :** NFR7 (webhooks signature), NFR15 (idempotence)
- **Additionnel :** Stripe Subscriptions, webhooks Subscriptions, bandeau alerte
- **Dépendances :** Epic 1 (auth)

### Epic 8 : Dashboard & Équipe
- **Objectif :** Fournir le tableau de bord (métriques, réservations du jour, préparation matériel 7 jours) et la gestion d'équipe (invitation, rôles).
- **FRs :** FR3, FR4, FR5, FR41, FR42, FR43
- **NFRs clés :** NFR3 (actions < 1s p95)
- **Additionnel :** TanStack Query v5, sidebar flottante par rôle, skeleton loading, responsive mobile simplifié "Aujourd'hui"
- **Dépendances :** Epic 1 (auth/rôles), Epic 4 (réservations pour les métriques)

### Epic 9 : Administration Plateforme
- **Objectif :** Fournir le dashboard admin Rentic (MRR, churn, abandons onboarding) et le monitoring applicatif.
- **FRs :** FR44, FR45, FR46, FR47
- **NFRs clés :** NFR19 (monitoring 100% erreurs)
- **Additionnel :** Sentry contextualisé, Stripe dashboard admin
- **Dépendances :** Epic 7 (abonnements), Epic 1 (auth)

### Flux de dépendances

```
Epic 1 (Foundation)
├── Epic 2 (Catalogue)
│   ├── Epic 3 (Packs)
│   │   └── Epic 5 (Site Web & Tunnel) ← aussi Epic 2, Epic 4
│   └── Epic 4 (Réservations) ← aussi Epic 3
│       ├── Epic 6 (Paiements) ← aussi Epic 5
│       └── Epic 8 (Dashboard & Équipe) ← aussi Epic 1
├── Epic 7 (Abonnement) — parallélisable dès Epic 1
└── Epic 9 (Admin) ← aussi Epic 7
```

## Epic 1 : Foundation, Auth & Accès

Mettre en place le projet (starter template, design system, DB fondation), l'authentification et le système de rôles owner/employee.

### Story 1.1 : Initialisation du projet avec starter template

As a développeur,
I want un projet Next.js 16 initialisé avec le starter Supabase, shadcn/ui, la structure feature-based, et les design tokens Rentic,
So that toute l'équipe dispose d'une base de code fonctionnelle et cohérente pour développer.

**Acceptance Criteria:**

**Given** aucun projet n'existe
**When** le starter template est exécuté et configuré
**Then** le projet Next.js 16 démarre sans erreur avec `npm run dev`
**And** shadcn/ui est initialisé avec les design tokens Rentic (palette indigo #5B6CF0, amber #F59E0B, fond lavande #F8F7FF, radius 16px)
**And** la font Bricolage Grotesque (variable, 200-800) est configurée
**And** la structure `features/` avec tests co-localisés est en place
**And** le pattern `ActionResult<T>` est défini dans `lib/types/`
**And** les fichiers de convention (eslint, prettier, tsconfig) sont configurés
**And** Sentry est intégré avec capture automatique des erreurs

### Story 1.2 : Schéma de base de données fondation et RLS

As a développeur,
I want le schéma de base de données fondation (shops, profiles, rôles) avec Row Level Security activé,
So that l'isolation multi-tenant est garantie dès le départ.

**Acceptance Criteria:**

**Given** le projet est initialisé (Story 1.1)
**When** les migrations Supabase sont exécutées
**Then** la table `shops` existe avec les champs essentiels (id, name, slug, created_at)
**And** la table `profiles` existe liée à `auth.users` avec champ `role` (owner/employee) et `shop_id`
**And** la fonction helper `get_user_shop_id()` est créée pour les policies RLS
**And** les policies RLS sont actives sur `shops` et `profiles` — un utilisateur ne voit que les données de son shop
**And** un test vérifie qu'un utilisateur du shop A ne peut pas accéder aux données du shop B
**And** les migrations sont versionées dans git

### Story 1.3 : Inscription loueur avec email et mot de passe

As a loueur,
I want créer un compte avec mon email et mon mot de passe,
So that je puisse accéder à la plateforme Rentic.

**Acceptance Criteria:**

**Given** un visiteur sur la page d'inscription
**When** il saisit un email valide et un mot de passe (min 8 caractères)
**Then** un compte `auth.users` est créé via Supabase Auth
**And** un `shop` est automatiquement créé
**And** un `profile` avec role `owner` est créé et lié au shop
**And** l'utilisateur est redirigé vers le dashboard (ou onboarding)
**And** un email de confirmation est envoyé

**Given** un email déjà utilisé
**When** le visiteur tente de s'inscrire
**Then** un message d'erreur clair est affiché ("Cet email est déjà utilisé")

**Given** un mot de passe trop court (< 8 caractères)
**When** le visiteur tente de s'inscrire
**Then** la validation côté client bloque la soumission avec un message explicite

### Story 1.4 : Connexion et déconnexion

As a utilisateur inscrit (owner ou employee),
I want me connecter et me déconnecter de mon compte,
So that je puisse accéder à mon espace de manière sécurisée.

**Acceptance Criteria:**

**Given** un utilisateur avec un compte valide
**When** il saisit ses identifiants corrects sur la page de connexion
**Then** il est authentifié et redirigé vers le dashboard
**And** sa session expire après 30 minutes d'inactivité (NFR9)

**Given** des identifiants incorrects
**When** l'utilisateur tente de se connecter
**Then** un message d'erreur générique est affiché ("Email ou mot de passe incorrect")

**Given** un utilisateur connecté
**When** il clique sur "Déconnexion"
**Then** sa session est invalidée et il est redirigé vers la page de connexion

### Story 1.5 : Middleware d'autorisation par rôle

As a système,
I want restreindre l'accès aux fonctions sensibles (prix, site web, paramètres, abonnement) aux owners uniquement,
So that les employés ne peuvent pas modifier les paramètres critiques du shop (FR6).

**Acceptance Criteria:**

**Given** un utilisateur avec le rôle `employee`
**When** il tente d'accéder à une route sensible (/settings, /website, /subscription, /pricing)
**Then** il est redirigé vers le dashboard avec un message "Accès réservé au propriétaire"

**Given** un utilisateur avec le rôle `owner`
**When** il accède à une route sensible
**Then** l'accès est autorisé normalement

**Given** un utilisateur non authentifié
**When** il tente d'accéder à une route protégée
**Then** il est redirigé vers la page de connexion

**And** le middleware est implémenté de manière centralisée (pas de vérification dupliquée dans chaque page)
**And** la sidebar flottante n'affiche que les liens autorisés selon le rôle de l'utilisateur

## Epic 2 : Onboarding & Catalogue

Permettre au loueur de compléter l'onboarding et de gérer son catalogue complet (catégories, attributs EAV, produits, unités, marques, disponibilité).

### Story 2.1 : Onboarding guidé — Profil et magasin

As a loueur fraîchement inscrit,
I want compléter mon profil et les informations de mon magasin dans un parcours guidé,
So that ma boutique soit configurée pour commencer à travailler.

**Acceptance Criteria:**

**Given** un owner venant de s'inscrire avec un shop vide
**When** il arrive sur le dashboard pour la première fois
**Then** il est redirigé vers le parcours d'onboarding (étape 1/3 : profil)

**Given** l'étape profil
**When** le loueur saisit son nom, prénom, téléphone
**Then** les données sont validées (Zod) et sauvegardées dans `profiles`
**And** il passe à l'étape 2/3 : informations magasin

**Given** l'étape magasin
**When** le loueur saisit le nom du magasin, adresse, SIRET, numéro TVA
**Then** les données sont validées et sauvegardées dans `shops`
**And** il passe à l'étape 3/3 : première catégorie

**And** une barre de progression indique l'avancement (1/3, 2/3, 3/3)
**And** le loueur peut revenir à l'étape précédente sans perdre ses données

### Story 2.2 : Onboarding — Première catégorie de produits

As a loueur en cours d'onboarding,
I want créer ma première catégorie de produits,
So that je comprenne la structure du catalogue et puisse commencer à ajouter des produits (FR2).

**Acceptance Criteria:**

**Given** le loueur est à l'étape 3/3 de l'onboarding
**When** il crée une catégorie avec un nom (ex: "Skis") et un type (produit ou participant)
**Then** la table `categories` est créée avec la migration correspondante (id, shop_id, name, type, created_at)
**And** la catégorie est sauvegardée et liée au shop
**And** les policies RLS sont actives sur `categories`
**And** l'onboarding est marqué comme complété dans `shops` (champ `onboarding_completed`)
**And** le loueur est redirigé vers le dashboard avec un empty state illustré l'invitant à ajouter des produits

### Story 2.3 : CRUD catégories de produits

As a loueur,
I want créer, modifier et supprimer des catégories de produits,
So that je puisse organiser mon catalogue par type d'équipement (FR7).

**Acceptance Criteria:**

**Given** un loueur connecté sur la page catalogue
**When** il clique sur "Nouvelle catégorie"
**Then** un formulaire s'affiche pour saisir le nom et le type de catégorie

**Given** un formulaire catégorie rempli
**When** le loueur valide
**Then** la catégorie est créée et apparaît dans la liste

**Given** une catégorie existante
**When** le loueur clique sur "Modifier"
**Then** il peut éditer le nom et le type, et les changements sont sauvegardés

**Given** une catégorie sans produits associés
**When** le loueur clique sur "Supprimer"
**Then** la catégorie est supprimée après confirmation

**Given** une catégorie avec des produits associés
**When** le loueur tente de la supprimer
**Then** un message l'informe qu'il doit d'abord déplacer ou supprimer les produits

### Story 2.4 : Attributs personnalisés par catégorie (EAV)

As a loueur,
I want définir des attributs personnalisés par catégorie (type produit ou participant, format texte/nombre/select),
So that je puisse capturer les informations spécifiques à chaque type d'équipement (FR8).

**Acceptance Criteria:**

**Given** une catégorie existante
**When** le loueur accède à la gestion des attributs de cette catégorie
**Then** il voit la liste des attributs définis (vide initialement avec empty state)

**Given** le formulaire d'ajout d'attribut
**When** le loueur définit un attribut avec : nom, scope (produit ou participant), format (texte, nombre, select)
**Then** la table `category_attributes` est créée (id, category_id, name, scope, format, options JSONB pour select, position, required)
**And** l'attribut est sauvegardé et apparaît dans la liste

**Given** un attribut de format "select"
**When** le loueur le crée
**Then** il peut définir les options possibles (ex: "S, M, L, XL" pour une taille)

**Given** un attribut existant
**When** le loueur le modifie ou le supprime
**Then** les changements sont répercutés (suppression uniquement si aucune valeur n'est associée)

**And** les policies RLS sont actives sur `category_attributes` via shop_id de la catégorie

### Story 2.5 : CRUD produits avec prix web et magasin

As a loueur,
I want créer, modifier et supprimer des produits avec un prix web et un prix magasin,
So that je puisse constituer mon catalogue avec une tarification différenciée (FR9).

**Acceptance Criteria:**

**Given** un loueur sur la page catalogue avec au moins une catégorie
**When** il clique sur "Nouveau produit"
**Then** un formulaire s'affiche avec : nom, description, catégorie (select), prix web (€), prix magasin (€), image

**Given** un formulaire produit rempli avec des données valides
**When** le loueur valide
**Then** la table `products` est créée (id, shop_id, category_id, name, description, price_web, price_shop, image_url, created_at)
**And** le produit est sauvegardé et apparaît dans le catalogue
**And** les valeurs des attributs produit (EAV) de la catégorie sont saisies et stockées dans `product_attribute_values`

**Given** un produit existant
**When** le loueur le modifie
**Then** tous les champs sont éditables et les changements sauvegardés

**Given** un produit sans réservations actives
**When** le loueur le supprime
**Then** le produit est supprimé après confirmation

**And** les policies RLS sont actives sur `products` et `product_attribute_values`

### Story 2.6 : Gestion des unités physiques (stock)

As a loueur,
I want gérer les unités physiques (stock unitaire) de chaque produit,
So that je puisse suivre mon inventaire réel et permettre le calcul de disponibilité (FR10).

**Acceptance Criteria:**

**Given** un produit existant
**When** le loueur accède à la gestion des unités
**Then** il voit la liste des unités physiques du produit (ex: "Ski #1", "Ski #2")

**Given** le formulaire d'ajout d'unité
**When** le loueur crée une unité avec un identifiant/nom et un statut (disponible/maintenance)
**Then** la table `product_units` est créée (id, product_id, label, status, created_at)
**And** l'unité est sauvegardée et le compteur de stock du produit est mis à jour

**Given** une unité existante
**When** le loueur la modifie (statut maintenance) ou la supprime
**Then** le stock disponible est recalculé en conséquence

**And** les policies RLS sont actives sur `product_units` via product → shop_id
**And** un indicateur visuel montre le stock total et disponible par produit

### Story 2.7 : Gestion des marques

As a loueur,
I want gérer une liste de marques et les associer à mes produits,
So that je puisse filtrer et organiser mon catalogue par marque (FR11).

**Acceptance Criteria:**

**Given** un loueur connecté
**When** il accède à la gestion des marques
**Then** il voit la liste de ses marques (vide initialement avec empty state)

**Given** le formulaire d'ajout de marque
**When** le loueur saisit un nom de marque
**Then** la table `brands` est créée (id, shop_id, name, created_at)
**And** la marque est sauvegardée

**Given** un produit en cours de création/modification
**When** le loueur sélectionne une marque dans le select
**Then** le champ `brand_id` du produit est mis à jour

**Given** une marque sans produits associés
**When** le loueur la supprime
**Then** la marque est supprimée après confirmation

**And** les policies RLS sont actives sur `brands`

### Story 2.8 : Mise à jour de la disponibilité stock

As a système,
I want mettre à jour la disponibilité du stock en < 5s après chaque changement de réservation,
So that les loueurs et clients voient toujours un stock à jour (FR12).

**Acceptance Criteria:**

**Given** une réservation est créée ou modifiée (statut change)
**When** le système traite l'événement
**Then** la disponibilité des unités concernées est recalculée en < 5s

**Given** une unité assignée à une réservation active
**When** la disponibilité est consultée pour une période chevauchante
**Then** l'unité est marquée comme indisponible pour cette période

**Given** une réservation est annulée
**When** le stock est recalculé
**Then** les unités libérées redeviennent disponibles immédiatement

**And** la logique de disponibilité est centralisée dans une fonction réutilisable (`check_availability`)
**And** des index appropriés sont en place sur les colonnes de dates et product_unit_id (NFR12)

## Epic 3 : Packs & Tarification

Permettre au loueur de créer des packs composés de produits avec gestion obligatoire/optionnel et tarification spécifique.

### Story 3.1 : CRUD packs multi-produits

As a loueur,
I want créer, modifier et supprimer des packs composés de plusieurs produits,
So that je puisse proposer des offres groupées à mes clients (FR13).

**Acceptance Criteria:**

**Given** un loueur avec au moins 2 produits dans son catalogue
**When** il clique sur "Nouveau pack"
**Then** un formulaire s'affiche avec : nom, description, image, et un sélecteur de produits

**Given** le formulaire pack rempli
**When** le loueur sélectionne au moins 2 produits et valide
**Then** la table `packs` est créée (id, shop_id, name, description, image_url, created_at)
**And** la table `pack_items` est créée (id, pack_id, product_id, is_required, price_web_override, price_shop_override, position)
**And** le pack est sauvegardé avec ses items associés

**Given** un pack existant
**When** le loueur le modifie (ajoute/retire des produits, change le nom)
**Then** les changements sont sauvegardés

**Given** un pack sans réservations actives
**When** le loueur le supprime
**Then** le pack et ses pack_items sont supprimés après confirmation

**And** les policies RLS sont actives sur `packs` et `pack_items`

### Story 3.2 : Gestion obligatoire/optionnel des produits dans un pack

As a loueur,
I want définir des produits obligatoires et optionnels dans un pack,
So that les clients puissent personnaliser leur pack tout en conservant les éléments essentiels (FR14).

**Acceptance Criteria:**

**Given** un pack en cours de création ou modification
**When** le loueur configure un item du pack
**Then** il peut basculer chaque produit entre "obligatoire" (inclus par défaut, non désactivable) et "optionnel" (activable/désactivable par le client)

**Given** un pack avec au moins un produit obligatoire
**When** le pack est sauvegardé
**Then** le champ `is_required` est correctement stocké pour chaque pack_item

**Given** un pack affiché dans le catalogue
**When** un client le consulte
**Then** les produits obligatoires sont clairement différenciés des optionnels (badge visuel)

**And** un pack doit contenir au moins un produit obligatoire (validation)

### Story 3.3 : Tarification spécifique par item de pack

As a loueur,
I want définir des prix spécifiques (web/magasin) pour les items d'un pack, différents du prix unitaire,
So that je puisse offrir des réductions groupées attractives (FR15).

**Acceptance Criteria:**

**Given** un pack en cours de création ou modification
**When** le loueur configure un item du pack
**Then** il peut définir un prix web override et un prix magasin override pour cet item
**And** si laissé vide, le prix unitaire du produit s'applique par défaut

**Given** un pack avec des prix overridés
**When** le prix total du pack est calculé
**Then** il additionne les prix override (ou unitaires si non overridés) de tous les items obligatoires
**And** les items optionnels montrent leur prix individuel (override ou unitaire)

**Given** un pack affiché dans le catalogue
**When** un client le consulte
**Then** le prix total du pack est affiché avec l'économie par rapport aux prix unitaires (si applicable)
**And** le prix barré unitaire est visible à côté du prix pack pour chaque item ayant un override

## Epic 4 : Gestion des Réservations Back-office

Permettre la création manuelle, la consultation (4 vues), la gestion des statuts, la collecte d'attributs participants et la prévention des double-bookings.

### Story 4.1 : Schéma de base de données réservations

As a développeur,
I want le schéma de données pour les réservations, les lignes de réservation et l'assignation d'unités,
So that le moteur de réservation dispose d'une base solide avec prévention des double-bookings (FR23).

**Acceptance Criteria:**

**Given** les tables produits et unités existent (Epic 2)
**When** les migrations sont exécutées
**Then** la table `reservations` est créée (id, shop_id, customer_name, customer_email, customer_phone, start_date, end_date, status, source, total_price, created_at)
**And** la table `reservation_items` est créée (id, reservation_id, product_id, pack_id nullable, quantity, unit_price, is_optional)
**And** la table `reservation_unit_assignments` est créée (id, reservation_item_id, product_unit_id, UNIQUE constraint sur (product_unit_id, période chevauchante))
**And** une contrainte d'exclusion PostgreSQL (ou trigger) empêche les double-bookings sur la même unité pour des périodes chevauchantes
**And** les policies RLS sont actives sur toutes les tables via shop_id
**And** les index sont en place sur (shop_id, status), (product_unit_id, start_date, end_date)

### Story 4.2 : Création de réservation manuelle

As a employé ou owner,
I want créer une réservation manuelle depuis le back-office,
So that je puisse enregistrer les clients qui réservent sur place ou par téléphone (FR19).

**Acceptance Criteria:**

**Given** un utilisateur connecté (owner ou employee) sur la page réservations
**When** il clique sur "Nouvelle réservation"
**Then** un formulaire s'affiche avec : dates (début/fin), informations client (nom, email, téléphone), sélection de produits/packs

**Given** le formulaire rempli avec des produits disponibles sur la période
**When** l'utilisateur valide
**Then** la réservation est créée avec le statut "confirmée" et la source "back-office"
**And** les unités physiques sont automatiquement assignées aux items
**And** le stock disponible est mis à jour en < 5s (FR12)
**And** un toast de confirmation s'affiche en bas à droite

**Given** un produit sans unités disponibles sur la période sélectionnée
**When** l'utilisateur tente de l'ajouter
**Then** un message indique l'indisponibilité et empêche l'ajout

**And** la source "back-office" est distinguée de "web" pour le suivi

### Story 4.3 : Consultation des réservations — 4 vues

As a employé ou owner,
I want consulter les réservations selon 4 vues (à venir, en cours, passées, annulées),
So that je puisse retrouver rapidement n'importe quelle réservation (FR20).

**Acceptance Criteria:**

**Given** un utilisateur connecté sur la page réservations
**When** il accède à la liste
**Then** 4 onglets sont affichés : "À venir", "En cours", "Passées", "Annulées"
**And** chaque onglet affiche le nombre de réservations correspondant

**Given** l'onglet "À venir" sélectionné
**When** la liste est chargée
**Then** seules les réservations avec start_date > now et status "confirmée" sont affichées
**And** triées par date de début croissante

**Given** l'onglet "En cours"
**When** la liste est chargée
**Then** seules les réservations avec status "en_cours" sont affichées

**Given** l'onglet "Passées"
**When** la liste est chargée
**Then** seules les réservations avec status "terminée" sont affichées, triées par date décroissante

**Given** l'onglet "Annulées"
**When** la liste est chargée
**Then** seules les réservations avec status "annulée" sont affichées

**And** chaque ligne affiche : client, dates, nb items, montant total, statut
**And** le chargement initial utilise skeleton loading
**And** les actions s'exécutent en < 1s p95 (NFR3)

### Story 4.4 : Modification du statut de réservation

As a employé ou owner,
I want modifier le statut d'une réservation (confirmer, démarrer, terminer, annuler),
So that je puisse suivre le cycle de vie de chaque location (FR21).

**Acceptance Criteria:**

**Given** une réservation avec statut "confirmée"
**When** l'utilisateur clique sur "Démarrer"
**Then** le statut passe à "en_cours" et l'heure de démarrage est enregistrée

**Given** une réservation avec statut "en_cours"
**When** l'utilisateur clique sur "Terminer"
**Then** le statut passe à "terminée" et les unités assignées sont libérées

**Given** une réservation avec statut "confirmée" ou "en_cours"
**When** l'utilisateur clique sur "Annuler"
**Then** une confirmation est demandée, puis le statut passe à "annulée" et les unités sont libérées

**And** les transitions de statut invalides sont bloquées (ex: on ne peut pas démarrer une réservation annulée)
**And** Supabase Realtime notifie les autres utilisateurs connectés du changement de statut
**And** un toast confirme l'action

### Story 4.5 : Collecte des attributs participants (EAV)

As a employé ou owner,
I want collecter les attributs participants dynamiques définis par catégorie lors de la réservation,
So that je puisse préparer le matériel adapté à chaque participant (FR22).

**Acceptance Criteria:**

**Given** une réservation contenant des produits dont la catégorie a des attributs de scope "participant"
**When** l'utilisateur crée ou modifie la réservation
**Then** un formulaire dynamique affiche les attributs participants de chaque catégorie concernée (ex: taille, poids, niveau pour "Skis")

**Given** les attributs participants remplis
**When** la réservation est sauvegardée
**Then** la table `participant_attribute_values` est créée (id, reservation_item_id, category_attribute_id, value, participant_index)
**And** les valeurs sont stockées et associées à chaque item/participant

**Given** une réservation existante avec des attributs participants
**When** l'utilisateur la consulte
**Then** les attributs participants sont affichés dans le détail de la réservation

**And** les attributs de format "select" affichent un dropdown avec les options définies
**And** les attributs requis (required=true) bloquent la validation si non remplis
**And** les policies RLS sont actives sur `participant_attribute_values`

### Story 4.6 : Toggle Vue Réservations ↔ Vue Matériel

As a employé ou owner,
I want basculer entre une Vue Réservations (par client) et une Vue Matériel (par équipement),
So that je puisse visualiser les réservations sous l'angle le plus adapté à ma tâche (innovation UX).

**Acceptance Criteria:**

**Given** un utilisateur sur la page réservations
**When** il clique sur le toggle "Vue Réservations" / "Vue Matériel"
**Then** la vue bascule instantanément entre les deux modes

**Given** la Vue Réservations active
**When** la liste est affichée
**Then** les réservations sont groupées par client avec leurs items

**Given** la Vue Matériel active
**When** la liste est affichée
**Then** les items sont groupés par produit/unité avec les réservations associées sur un timeline
**And** chaque unité montre son calendrier d'occupation

**And** le toggle conserve les filtres actifs (onglet de statut)
**And** la préférence de vue est persistée en local storage

## Epic 5 : Site Web & Tunnel de Réservation

Permettre au loueur de configurer et publier son site web public avec catalogue, et intégrer le tunnel de réservation complet pour les clients.

### Story 5.1 : Configuration du site web — Landing page

As a loueur,
I want configurer et publier un site web avec une landing page (hero, sections personnalisables, informations magasin),
So that mes clients puissent découvrir mon activité en ligne (FR25).

**Acceptance Criteria:**

**Given** un owner connecté sur la page "Site Web"
**When** il accède à l'éditeur de site
**Then** il voit un formulaire avec : titre hero, sous-titre, image hero, sections personnalisables (texte libre, horaires, localisation), informations magasin (adresse, téléphone, email)

**Given** la table `shop_websites` n'existe pas encore
**When** les migrations sont exécutées
**Then** la table `shop_websites` est créée (id, shop_id, hero_title, hero_subtitle, hero_image_url, sections JSONB, is_published, created_at, updated_at)
**And** les policies RLS sont actives

**Given** le formulaire rempli
**When** le loueur clique sur "Publier"
**Then** le site est marqué comme publié (`is_published = true`)
**And** un toast confirme la publication

**Given** un site déjà publié
**When** le loueur modifie les sections
**Then** les changements sont sauvegardés et la page est revalidée (ISR on-demand)

### Story 5.2 : URL publique unique (slug) et rendu public

As a loueur,
I want que mon site soit accessible via une URL publique unique basée sur un slug,
So that mes clients puissent accéder facilement à ma boutique en ligne (FR28).

**Acceptance Criteria:**

**Given** un shop avec un slug défini (ex: "ski-alpes-73")
**When** un visiteur accède à `/shop/ski-alpes-73`
**Then** la landing page du loueur est rendue côté serveur (SSR/ISR)
**And** le LCP est < 2s (NFR1)

**Given** un slug inexistant
**When** un visiteur accède à `/shop/inexistant`
**Then** une page 404 est affichée

**Given** la page publique rendue
**When** un crawler l'indexe
**Then** les meta tags (title, description, og:image) sont correctement définis
**And** un sitemap.xml dynamique est généré pour chaque shop publié (NFR22)

**And** le slug est unique par shop et validé (alphanumérique + tirets)
**And** le cache CDN sert 95% des requêtes (NFR11) avec revalidation ISR

### Story 5.3 : Affichage catalogue public (catégories, produits, packs)

As a client,
I want consulter le catalogue du loueur avec ses catégories, produits, packs et prix,
So that je puisse explorer l'offre avant de réserver (FR26).

**Acceptance Criteria:**

**Given** un visiteur sur le site public d'un loueur
**When** il accède à la section catalogue
**Then** les catégories sont affichées avec navigation par onglets ou sections

**Given** une catégorie sélectionnée
**When** les produits sont affichés
**Then** chaque produit montre : nom, image, prix web, marque (si définie)
**And** les packs sont affichés dans une section dédiée avec prix total et badge "Pack"

**Given** un pack affiché
**When** le client le consulte
**Then** les produits obligatoires et optionnels sont listés avec leurs prix
**And** l'économie par rapport aux prix unitaires est visible

**And** la page est responsive de 320px à 1440px (FR29)
**And** le design applique les tokens Soft Rounded (radius 16px, fond lavande)
**And** le score Lighthouse est > 90 desktop, > 85 mobile (NFR20)

### Story 5.4 : Configuration CGV/CGU

As a loueur,
I want configurer mes CGV/CGU affichées sur mon site,
So that je sois en conformité légale vis-à-vis de mes clients (FR30).

**Acceptance Criteria:**

**Given** un owner sur la page configuration du site
**When** il accède à la section "CGV/CGU"
**Then** un éditeur texte riche permet de saisir les conditions générales

**Given** les CGV/CGU saisies et sauvegardées
**When** un visiteur accède à la page `/shop/{slug}/cgv`
**Then** les CGV/CGU sont affichées dans une page dédiée

**Given** le tunnel de réservation
**When** le client arrive à l'étape de validation
**Then** un lien vers les CGV/CGU est affiché avec une case à cocher "J'accepte les conditions générales"

### Story 5.5 : Tunnel de réservation — Sélection des dates et disponibilité

As a client,
I want sélectionner des dates de location puis consulter les produits et packs disponibles sur cette période,
So that je ne voie que ce qui est réellement louable à mes dates (FR16, FR17).

**Acceptance Criteria:**

**Given** un client sur le site public d'un loueur
**When** il sélectionne une date de début et une date de fin via un date picker
**Then** le système calcule la disponibilité de chaque produit et pack en fonction du stock unitaire

**Given** les dates sélectionnées
**When** la disponibilité est affichée
**Then** les produits disponibles montrent le nombre d'unités restantes
**And** les produits entièrement réservés sont grisés avec "Indisponible"
**And** les packs dont tous les items obligatoires sont disponibles sont affichés comme disponibles
**And** le calcul répond en < 500ms (NFR2)

**Given** le client modifie les dates
**When** la disponibilité est recalculée
**Then** l'affichage se met à jour dynamiquement sans rechargement de page

**And** le date picker empêche de sélectionner des dates passées
**And** les cibles tactiles sont ≥ 44x44px sur mobile (NFR21)

### Story 5.6 : Tunnel de réservation — Sélection produits et packs (browse + add to cart)

As a client,
I want parcourir les produits/packs disponibles et les ajouter à mon panier,
So that je puisse composer ma réservation librement (FR27).

**Acceptance Criteria:**

**Given** un client avec des dates sélectionnées et des produits disponibles
**When** il parcourt le catalogue disponible
**Then** il peut ajouter des produits individuels ou des packs à son panier via un bouton "Ajouter"
**And** le pattern est browse + add to cart (pas un wizard linéaire)

**Given** un pack ajouté au panier
**When** le client le consulte dans le panier
**Then** il peut activer/désactiver les produits optionnels du pack (FR18)
**And** un drawer s'ouvre à droite pour la personnalisation d'équipement

**Given** des items dans le panier
**When** le client consulte le récapitulatif
**Then** le prix total est calculé en temps réel (items + optionnels activés)
**And** chaque item affiche son prix unitaire

**And** le panier est persisté en session (survit au rafraîchissement)
**And** le tunnel est utilisable dès 320px de large (NFR21)

### Story 5.7 : Tunnel de réservation — Informations participants

As a client,
I want renseigner les informations des participants pour chaque item réservé,
So that le loueur puisse préparer le matériel adapté (FR22 via tunnel).

**Acceptance Criteria:**

**Given** un client avec des items dans son panier
**When** il passe à l'étape "Participants"
**Then** un formulaire dynamique s'affiche pour chaque item, demandant les attributs participants définis par catégorie (EAV)

**Given** les attributs à remplir (ex: taille, poids, niveau pour des skis)
**When** le client saisit les informations
**Then** la validation (Zod) vérifie les formats (texte, nombre, select) et les champs requis

**Given** tous les attributs requis sont remplis
**When** le client clique sur "Continuer"
**Then** il passe à l'étape récapitulatif/paiement

**And** le formulaire s'adapte dynamiquement au nombre de participants par item
**And** les attributs "select" affichent un dropdown avec les options définies par le loueur

### Story 5.8 : Responsive et performance des pages publiques

As a client,
I want que le site du loueur soit rapide et parfaitement lisible sur mon appareil (mobile ou desktop),
So that je puisse réserver confortablement depuis n'importe quel écran (FR29, NFR1, NFR20, NFR21).

**Acceptance Criteria:**

**Given** un visiteur sur un écran de 320px
**When** il navigue sur le site public
**Then** toutes les pages sont lisibles sans scroll horizontal
**And** les cibles tactiles sont ≥ 44x44px
**And** la navigation est adaptée (menu hamburger, layout single-column)

**Given** un visiteur sur un écran de 1440px
**When** il navigue sur le site public
**Then** le layout exploite la largeur avec colonnes multiples et espacement généreux

**Given** le score Lighthouse est mesuré
**When** le test est exécuté
**Then** le score est > 90 en desktop et > 85 en mobile (performance, SEO, accessibilité)

**And** les images sont optimisées (next/image, formats WebP/AVIF)
**And** le WCAG 2.1 AA est respecté (contrastes, labels, navigation clavier)

## Epic 6 : Paiements & Facturation

Intégrer les paiements en ligne (Stripe Connect) et espèces, la génération de factures PDF conformes et les emails transactionnels.

### Story 6.1 : Onboarding Stripe Connect Express pour les loueurs

As a loueur (owner),
I want connecter mon compte bancaire via Stripe Connect Express,
So that les paiements de mes clients soient versés directement sur mon compte marchand dédié (FR33).

**Acceptance Criteria:**

**Given** un owner sur la page "Paramètres > Paiements"
**When** il clique sur "Connecter Stripe"
**Then** il est redirigé vers le flux Stripe Connect Express onboarding

**Given** le loueur a complété l'onboarding Stripe
**When** le webhook `account.updated` est reçu
**Then** la table `shop_stripe_accounts` est créée (id, shop_id, stripe_account_id, charges_enabled, payouts_enabled, created_at)
**And** le statut du compte est mis à jour

**Given** un loueur avec `charges_enabled = true`
**When** il consulte la page Paiements
**Then** un badge "Paiements actifs" est affiché

**Given** un loueur sans compte Stripe connecté
**When** un client tente de payer en ligne
**Then** le paiement en ligne n'est pas disponible et un message indique que le loueur doit configurer ses paiements

**And** aucune donnée de carte bancaire ne transite côté serveur (NFR6)

### Story 6.2 : Paiement en ligne par carte bancaire

As a client,
I want payer ma réservation en ligne par carte bancaire,
So that ma réservation soit confirmée immédiatement (FR31).

**Acceptance Criteria:**

**Given** un client à l'étape paiement du tunnel avec un panier validé
**When** il choisit le paiement par carte
**Then** un Payment Intent Stripe est créé via l'API (côté serveur) avec le compte Connect du loueur comme destination
**And** le formulaire Stripe Elements s'affiche (aucune donnée carte côté serveur — NFR6)

**Given** le paiement réussi
**When** le webhook `payment_intent.succeeded` est reçu
**Then** la réservation est créée avec statut "confirmée" et source "web"
**And** les unités physiques sont assignées
**And** la table `payments` est créée (id, reservation_id, stripe_payment_intent_id, amount, status, method, created_at)
**And** le paiement est enregistré avec status "succeeded"

**Given** le paiement échoue
**When** Stripe retourne une erreur
**Then** un message d'erreur clair est affiché au client
**And** la réservation n'est pas créée

**And** le webhook vérifie la signature cryptographique (NFR7)
**And** le traitement est idempotent — un même event_id n'est traité qu'une fois (NFR15)
**And** chaque étape du tunnel répond en < 500ms (NFR2)

### Story 6.3 : Paiement en espèces back-office

As a employé ou owner,
I want enregistrer un paiement en espèces pour une réservation sur place,
So that je puisse suivre tous les paiements même hors ligne (FR32).

**Acceptance Criteria:**

**Given** une réservation existante sans paiement
**When** l'utilisateur clique sur "Enregistrer paiement espèces"
**Then** un formulaire s'affiche avec le montant pré-rempli (modifiable)

**Given** le formulaire validé
**When** le paiement est enregistré
**Then** un enregistrement est créé dans `payments` avec method "cash" et status "succeeded"
**And** la réservation est marquée comme payée

**Given** un paiement espèces enregistré
**When** l'utilisateur consulte la réservation
**Then** le paiement est visible avec la mention "Espèces" et la date

### Story 6.4 : Génération de facture PDF conforme

As a système,
I want générer automatiquement une facture PDF conforme (mentions légales, SIRET, TVA),
So that chaque réservation payée dispose d'une facture légale (FR34).

**Acceptance Criteria:**

**Given** un paiement réussi (carte ou espèces)
**When** la facture est générée
**Then** un PDF est créé contenant : numéro de facture séquentiel, date, informations loueur (nom, adresse, SIRET, TVA), informations client, détail des items avec prix unitaires, total HT, TVA, total TTC
**And** la table `invoices` est créée (id, reservation_id, payment_id, invoice_number, pdf_url, created_at)

**Given** la facture générée
**When** elle est stockée
**Then** le PDF est uploadé dans Supabase Storage avec accès restreint
**And** l'URL est enregistrée dans `invoices`

**Given** un utilisateur (owner, employee ou client)
**When** il accède au détail d'une réservation
**Then** un bouton "Télécharger la facture" est disponible

**And** le numéro de facture est séquentiel par shop (ex: SHOP-2026-001)
**And** les policies RLS sont actives sur `invoices`

### Story 6.5 : Emails transactionnels (confirmation + facture)

As a client,
I want recevoir une confirmation de réservation par email avec facture PDF,
So that j'aie une preuve de ma réservation et de mon paiement (FR24, FR35).

**Acceptance Criteria:**

**Given** une réservation confirmée avec paiement réussi
**When** le système traite la confirmation
**Then** un email est envoyé au client via Resend contenant : récapitulatif de la réservation (dates, items, montant), informations du loueur, la facture PDF en pièce jointe
**And** l'email est envoyé en < 30s après le paiement (NFR18)

**Given** une invitation employé (FR3 — Epic 8)
**When** un owner invite un employé
**Then** un email d'invitation est envoyé avec un lien de création de compte

**Given** l'envoi d'email échoue
**When** Resend retourne une erreur
**Then** l'erreur est loguée dans Sentry avec contexte (shop_id, reservation_id)
**And** un retry est tenté (3x avec backoff)

**And** les templates email sont cohérents avec le design Rentic (palette, logo)
**And** la table `email_logs` est créée pour le suivi (id, shop_id, type, recipient, status, sent_at)

### Story 6.6 : Webhook Stripe Connect et réconciliation

As a système,
I want traiter les webhooks Stripe Connect de manière fiable avec vérification de signature et idempotence,
So that 100% des paiements sont réconciliés sans double traitement (NFR7, NFR14, NFR15).

**Acceptance Criteria:**

**Given** un webhook Stripe Connect entrant sur `/api/webhooks/stripe-connect`
**When** la requête arrive
**Then** la signature est vérifiée avec le webhook secret (NFR7)
**And** si la signature est invalide, la requête est rejetée avec 401

**Given** un event_id déjà traité
**When** le même webhook est reçu (retry Stripe)
**Then** il est ignoré grâce à la table `webhook_events` (id, event_id, type, processed_at) avec UNIQUE sur event_id (NFR15)

**Given** un webhook `payment_intent.succeeded`
**When** il est traité
**Then** le paiement dans `payments` est mis à jour si nécessaire
**And** la réconciliation est vérifiée (montant Stripe = montant enregistré)

**Given** Stripe est temporairement indisponible
**When** une opération Stripe échoue
**Then** le système retry 3x avec backoff exponentiel (NFR17)

**And** les erreurs de webhook sont loguées dans Sentry avec contexte complet

## Epic 7 : Abonnement SaaS

Gérer le cycle de vie des abonnements loueurs (essai, souscription, facturation, annulation) et le blocage en cas d'impayé.

### Story 7.1 : Mois d'essai gratuit à l'inscription

As a loueur,
I want bénéficier d'un mois d'essai gratuit à l'inscription,
So that je puisse tester la plateforme avant de m'engager financièrement (FR37).

**Acceptance Criteria:**

**Given** un loueur qui vient de compléter l'onboarding
**When** son shop est créé
**Then** la table `subscriptions` est créée (id, shop_id, stripe_subscription_id nullable, plan, status, trial_ends_at, current_period_start, current_period_end, created_at)
**And** un abonnement est créé avec status "trialing" et trial_ends_at = now + 30 jours

**Given** un loueur en période d'essai
**When** il consulte la page abonnement
**Then** il voit "Essai gratuit — X jours restants" avec un CTA pour souscrire

**Given** la période d'essai expire
**When** trial_ends_at est dépassé sans souscription
**Then** le statut passe à "expired"
**And** les fonctionnalités de création de réservation en ligne sont bloquées (FR40)

**And** les policies RLS sont actives sur `subscriptions`

### Story 7.2 : Souscription à un plan d'abonnement

As a loueur,
I want souscrire à un plan d'abonnement (Saison 450€ ou Annuel 790€),
So that je puisse continuer à utiliser la plateforme après l'essai (FR36).

**Acceptance Criteria:**

**Given** un owner sur la page abonnement
**When** il choisit un plan (Saison ou Annuel)
**Then** il est redirigé vers Stripe Checkout pour saisir ses informations de paiement

**Given** le paiement Stripe réussi
**When** le webhook `checkout.session.completed` est reçu
**Then** le stripe_subscription_id est enregistré dans `subscriptions`
**And** le statut passe à "active"
**And** un toast confirme la souscription

**Given** le paiement échoue
**When** Stripe retourne une erreur
**Then** le loueur reste sur son statut actuel avec un message d'erreur

**And** les deux plans sont clairement présentés avec leurs différences (durée, prix)
**And** le webhook vérifie la signature (NFR7)

### Story 7.3 : Cycle de vie de l'abonnement

As a système,
I want gérer le cycle de vie complet de l'abonnement (essai → actif → impayé → annulé),
So that la plateforme reste viable financièrement et les loueurs soient informés (FR38).

**Acceptance Criteria:**

**Given** un abonnement actif
**When** le webhook `invoice.payment_succeeded` est reçu
**Then** les dates current_period_start et current_period_end sont mises à jour

**Given** un paiement de renouvellement échoué
**When** le webhook `invoice.payment_failed` est reçu
**Then** le statut passe à "past_due" (impayé)
**And** un email d'alerte est envoyé au loueur

**Given** un abonnement impayé après les retries Stripe
**When** le webhook `customer.subscription.deleted` est reçu
**Then** le statut passe à "canceled"

**Given** un webhook d'abonnement entrant
**When** il est traité
**Then** la synchronisation se fait en < 60s (FR45)
**And** le traitement est idempotent via `webhook_events` (NFR15)

**And** la table `webhook_events` est réutilisée (même que Epic 6) pour les events Subscription

### Story 7.4 : Consultation et gestion de l'abonnement

As a loueur (owner),
I want consulter et gérer mon abonnement (plan actuel, facturation, annulation),
So that je garde le contrôle sur mon engagement (FR39).

**Acceptance Criteria:**

**Given** un owner sur la page "Abonnement"
**When** la page se charge
**Then** il voit : plan actuel (Saison/Annuel/Essai), statut, prochaine date de facturation, historique des paiements

**Given** un owner avec un abonnement actif
**When** il clique sur "Gérer la facturation"
**Then** il est redirigé vers le portail Stripe Customer Portal pour modifier sa carte, télécharger ses factures

**Given** un owner qui souhaite annuler
**When** il clique sur "Annuler l'abonnement"
**Then** une confirmation est demandée avec mention de la date de fin effective
**And** l'annulation est programmée en fin de période via Stripe (pas immédiate)

**Given** un abonnement annulé en fin de période
**When** la période se termine
**Then** le statut passe à "canceled" via webhook

### Story 7.5 : Bandeau d'alerte et blocage si abonnement inactif

As a système,
I want afficher un bandeau d'alerte et bloquer la création de nouvelles réservations en ligne si l'abonnement est inactif,
So that les loueurs en impayé soient incités à régulariser (FR40).

**Acceptance Criteria:**

**Given** un loueur avec un abonnement "past_due"
**When** il accède au dashboard
**Then** un bandeau d'alerte jaune est affiché : "Votre paiement a échoué. Mettez à jour vos informations de paiement pour continuer."
**And** un lien vers la gestion d'abonnement est inclus

**Given** un loueur avec un abonnement "canceled" ou "expired"
**When** il accède au dashboard
**Then** un bandeau d'alerte rouge est affiché : "Votre abonnement est inactif. Souscrivez un plan pour réactiver vos services."

**Given** un abonnement inactif (canceled, expired, past_due)
**When** un client tente de faire une réservation en ligne sur le site du loueur
**Then** le tunnel de réservation est désactivé avec un message "Réservation en ligne temporairement indisponible"

**Given** un abonnement inactif
**When** un employee/owner crée une réservation manuelle
**Then** la création manuelle reste possible (pas de blocage back-office)

**And** le bandeau est visible sur toutes les pages du dashboard
**And** le check d'abonnement est centralisé dans un middleware/hook réutilisable

## Epic 8 : Dashboard & Équipe

Fournir le tableau de bord (métriques, réservations du jour, préparation matériel 7 jours) et la gestion d'équipe (invitation, rôles).

### Story 8.1 : Dashboard owner — Métriques clés

As a loueur (owner),
I want consulter un tableau de bord avec les métriques clés (réservations du jour, CA, taux d'occupation),
So that je puisse piloter mon activité en un coup d'œil (FR41).

**Acceptance Criteria:**

**Given** un owner connecté sur le dashboard
**When** la page se charge
**Then** les métriques suivantes sont affichées : nombre de réservations du jour, chiffre d'affaires du mois en cours, taux d'occupation du stock (unités réservées / total), nombre de réservations à venir

**Given** le chargement des données
**When** les requêtes sont en cours
**Then** des skeleton loaders sont affichés pour chaque carte de métrique

**Given** les données chargées
**When** l'owner consulte le dashboard
**Then** les données sont gérées via TanStack Query v5 avec cache et revalidation
**And** les actions s'exécutent en < 1s p95 (NFR3)

**And** le layout est responsive : version complète sur desktop, version simplifiée "Aujourd'hui" sur mobile

### Story 8.2 : Dashboard employé — Réservations du jour

As a employé,
I want consulter le tableau de bord des réservations du jour,
So that je puisse préparer les équipements pour les clients attendus (FR42).

**Acceptance Criteria:**

**Given** un employé connecté sur le dashboard
**When** la page se charge
**Then** il voit la liste des réservations du jour avec : nom client, heure prévue, items réservés, statut

**Given** le rôle employee
**When** le dashboard est affiché
**Then** seules les métriques autorisées sont visibles (réservations du jour, pas le CA ni les paramètres sensibles)

**Given** un écran mobile
**When** l'employé consulte le dashboard
**Then** la vue "Aujourd'hui" est affichée : liste simplifiée des réservations du jour avec actions rapides (démarrer, terminer)

**And** les données sont gérées via TanStack Query v5
**And** skeleton loading pendant le chargement initial

### Story 8.3 : Préparation matériel — Réservations 7 prochains jours

As a employé ou owner,
I want consulter les réservations des 7 prochains jours avec les détails participants,
So that je puisse préparer le matériel à l'avance (FR43).

**Acceptance Criteria:**

**Given** un utilisateur sur la section "Préparation"
**When** la page se charge
**Then** les réservations des 7 prochains jours sont listées, groupées par jour

**Given** chaque réservation affichée
**When** l'utilisateur la consulte
**Then** les détails participants sont visibles : attributs EAV (taille, poids, niveau...) pour chaque item
**And** les produits/unités à préparer sont listés

**Given** une réservation pour demain
**When** elle est affichée
**Then** un badge "Demain" la met en évidence

**And** les données sont paginées par jour pour optimiser les performances
**And** les actions s'exécutent en < 1s p95 (NFR3)

### Story 8.4 : Invitation d'employé par email

As a loueur (owner),
I want inviter un employé par email,
So that il puisse accéder aux sections autorisées du dashboard (FR3).

**Acceptance Criteria:**

**Given** un owner sur la page "Équipe"
**When** il clique sur "Inviter un employé"
**Then** un formulaire s'affiche avec : email, prénom, nom

**Given** le formulaire validé
**When** l'invitation est envoyée
**Then** un email d'invitation est envoyé via Resend avec un lien de création de compte
**And** la table `invitations` est créée (id, shop_id, email, status, invited_by, created_at, expires_at)
**And** l'invitation est visible dans la liste avec statut "en attente"

**Given** l'employé clique sur le lien d'invitation
**When** il crée son compte
**Then** un `profile` avec role `employee` est créé et lié au shop de l'owner
**And** l'invitation passe en statut "acceptée"

**Given** une invitation expirée (> 7 jours)
**When** l'employé clique sur le lien
**Then** un message "Invitation expirée" est affiché avec invitation à contacter le loueur

**And** les policies RLS sont actives sur `invitations`

### Story 8.5 : Gestion des comptes employés

As a loueur (owner),
I want gérer les comptes employés (consulter, désactiver),
So that je contrôle qui a accès à mon espace (FR5).

**Acceptance Criteria:**

**Given** un owner sur la page "Équipe"
**When** la page se charge
**Then** la liste des employés est affichée avec : nom, email, statut (actif/désactivé), date d'ajout

**Given** un employé actif
**When** l'owner clique sur "Désactiver"
**Then** une confirmation est demandée
**And** le profil employé est marqué comme désactivé
**And** l'employé ne peut plus se connecter

**Given** un employé désactivé
**When** l'owner clique sur "Réactiver"
**Then** le profil est réactivé et l'employé peut se reconnecter

**And** un owner ne peut pas se désactiver lui-même
**And** la désactivation ne supprime pas les données (soft disable)

### Story 8.6 : Navigation par rôle — Sidebar flottante

As a utilisateur connecté (owner ou employee),
I want voir une sidebar de navigation adaptée à mon rôle,
So that je n'accède qu'aux sections qui me sont autorisées (FR4, FR6).

**Acceptance Criteria:**

**Given** un owner connecté
**When** la sidebar est affichée
**Then** tous les liens sont visibles : Dashboard, Réservations, Catalogue, Packs, Site Web, Paramètres, Abonnement, Équipe

**Given** un employee connecté
**When** la sidebar est affichée
**Then** seuls les liens autorisés sont visibles : Dashboard, Réservations, Catalogue
**And** les liens sensibles (Site Web, Paramètres, Abonnement, Équipe) sont masqués

**Given** n'importe quel utilisateur
**When** il navigue
**Then** la sidebar est flottante (overlay) avec animation d'ouverture/fermeture
**And** le lien actif est mis en surbrillance
**And** le nom de l'utilisateur et le nom du shop sont affichés en haut de la sidebar

## Epic 9 : Administration Plateforme

Fournir le dashboard admin Rentic (MRR, churn, abandons onboarding) et le monitoring applicatif.

### Story 9.1 : Dashboard admin — Métriques abonnements

As a admin Rentic,
I want suivre les abonnements actifs, le MRR, les essais en cours et les churns,
So that je puisse piloter la santé financière de la plateforme (FR44).

**Acceptance Criteria:**

**Given** un admin connecté sur le dashboard admin
**When** la page se charge
**Then** les métriques suivantes sont affichées : nombre d'abonnements actifs, MRR (Monthly Recurring Revenue), nombre d'essais en cours, nombre de churns (annulations) du mois, taux de conversion essai → payant

**Given** le dashboard admin
**When** les données sont chargées
**Then** les métriques sont calculées à partir de la table `subscriptions` et agrégées
**And** un graphique d'évolution du MRR sur les 6 derniers mois est affiché

**Given** un admin
**When** il consulte la liste des loueurs
**Then** chaque loueur affiche : nom, plan, statut abonnement, date d'inscription, CA généré

**And** l'accès est restreint au rôle admin (middleware dédié, distinct des rôles owner/employee)
**And** le dashboard admin est sur une route protégée `/admin`

### Story 9.2 : Synchronisation abonnements via webhooks

As a système,
I want synchroniser l'état des abonnements avec Stripe en < 60s via webhooks,
So that le dashboard admin reflète toujours la réalité (FR45).

**Acceptance Criteria:**

**Given** un webhook Stripe Subscriptions entrant sur `/api/webhooks/stripe-subscriptions`
**When** un événement de type `customer.subscription.created`, `customer.subscription.updated`, ou `customer.subscription.deleted` est reçu
**Then** la table `subscriptions` est mise à jour en < 60s

**Given** le webhook reçu
**When** il est traité
**Then** la signature est vérifiée (NFR7)
**And** le traitement est idempotent via `webhook_events` (NFR15)

**Given** un nouvel abonnement créé via webhook
**When** les métriques admin sont consultées
**Then** le MRR est recalculé et reflète le nouvel abonnement

**And** l'endpoint `/api/webhooks/stripe-subscriptions` est distinct de `/api/webhooks/stripe-connect` (double flux)

### Story 9.3 : Identification des abandons d'onboarding

As a admin Rentic,
I want identifier les abandons d'onboarding (profils non complétés),
So that je puisse prendre des actions pour améliorer la conversion (FR46).

**Acceptance Criteria:**

**Given** un admin sur le dashboard admin
**When** il accède à la section "Onboarding"
**Then** la liste des loueurs avec onboarding incomplet est affichée : email, date d'inscription, dernière étape complétée

**Given** la liste d'abandons
**When** les données sont filtrées
**Then** l'admin peut filtrer par période (7 jours, 30 jours, tout) et par étape d'abandon (profil, magasin, catégorie)

**Given** un loueur avec `onboarding_completed = false` depuis plus de 7 jours
**When** il apparaît dans la liste
**Then** un badge "Abandonné" est affiché

**And** le taux de complétion global de l'onboarding est affiché en métrique
**And** les données sont calculées à partir de `shops` et `profiles`

### Story 9.4 : Monitoring applicatif et journalisation

As a système,
I want journaliser les erreurs applicatives avec stack trace, identifiant utilisateur et shop_id,
So that l'équipe technique puisse diagnostiquer rapidement les problèmes (FR47, NFR19).

**Acceptance Criteria:**

**Given** une erreur non gérée se produit côté serveur
**When** Sentry la capture
**Then** le contexte inclut : stack trace, user_id, shop_id, route, méthode HTTP, timestamp

**Given** une erreur côté client (React error boundary)
**When** elle est capturée
**Then** elle est envoyée à Sentry avec le même contexte (user_id, shop_id)

**Given** un admin sur le dashboard admin
**When** il accède à la section "Monitoring"
**Then** un lien vers le projet Sentry est affiché avec le nombre d'erreurs non résolues des 24 dernières heures

**And** Sentry est configuré avec le contexte `shop_id` et `user` sur toutes les routes (middleware)
**And** 100% des erreurs non gérées sont capturées (NFR19)
**And** les informations sensibles (tokens, mots de passe) sont exclues des rapports Sentry

## Récapitulatif

| Epic | Stories | FRs couverts |
|------|---------|-------------|
| Epic 1 : Foundation, Auth & Accès | 5 | FR1, FR6 |
| Epic 2 : Onboarding & Catalogue | 8 | FR2, FR7-FR12 |
| Epic 3 : Packs & Tarification | 3 | FR13-FR15 |
| Epic 4 : Réservations Back-office | 6 | FR19-FR23 |
| Epic 5 : Site Web & Tunnel | 8 | FR16-FR18, FR25-FR30 |
| Epic 6 : Paiements & Facturation | 6 | FR24, FR31-FR35 |
| Epic 7 : Abonnement SaaS | 5 | FR36-FR40 |
| Epic 8 : Dashboard & Équipe | 6 | FR3-FR5, FR41-FR43 |
| Epic 9 : Administration Plateforme | 4 | FR44-FR47 |
| **Total** | **51 stories** | **47/47 FRs (100%)** |
