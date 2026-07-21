# Analyse complète de l'application Bubble Rentic

**Date d'analyse :** 26 février 2026
**Source :** Application Bubble rentic-65966 (version live)
**Objectif :** Document de référence pour la réécriture en code d'une plateforme de location saisonnière généralisée

---

## 1. Vue d'ensemble

Rentic est une application SaaS B2B2C de gestion de location saisonnière. Les **propriétaires de magasins** s'abonnent à la plateforme, configurent leur inventaire et leur vitrine en ligne. Les **clients finaux** réservent et paient du matériel via la page publique du magasin.

### Trois audiences, trois univers

| Audience | Pages | Description |
|----------|-------|-------------|
| **Prospects (marketing)** | `index`, `confidentialite`, `mentions-legales` | Site vitrine Rentic pour convertir des loueurs |
| **Propriétaires/Employés (B2B)** | `app`, `sign-in`, `onboarding` | Application de gestion complète |
| **Clients finaux (B2C)** | `shop`, `reservation`, `legal`, `invoice` | Vitrine du magasin + tunnel de réservation |

### Architecture multi-tenant

Le type `shop` est le pivot central. Sur 25 types de données, **16 référencent directement `shop`**, assurant une isolation logique des données par magasin.

---

## 2. Modèle de données complet

### 2.1 Domaines fonctionnels

| Domaine | Types de données | Rôle |
|---------|-----------------|------|
| **Catalogue** | Brand, ProductModel, Product Variant, itemUnit, Pack, PackedProduct | Produits et inventaire physique |
| **Commerce** | Reservation, itemReserved, Promotion, Client, Participant | Cycle de réservation |
| **Paiements** | Subscription, subscription_Payment, Reservation_Payment | Facturation SaaS + paiements clients |
| **Boutique** | shop, landing page, availability, LP_activities, LP_Category, LP_testimonials | Magasins et sites web |
| **Système** | User, App settings | Utilisateurs et configuration |

### 2.2 Entités détaillées

#### User (Utilisateur)

| Champ | Type | Description |
|-------|------|-------------|
| firstName | Text | Prénom |
| lastName | Text | Nom |
| image | Image | Photo de profil |
| ID_stripe_connect | Text | Identifiant Stripe Connect |
| ID_stripe_customer | Text | Identifiant client Stripe |
| isOnboarded? | Boolean (défaut: false) | Onboarding terminé |
| onboarding_current_step | Number | Étape courante de l'onboarding |
| Role | Option: Role | Rôle (Admin, Owner, Employee) |
| shop | -> shop | Magasin associé |

#### shop (Magasin)

| Champ | Type | Description |
|-------|------|-------------|
| name | Text | Nom du magasin |
| email | Text | Email |
| phone | Text | Téléphone |
| address | Geographic address | Adresse géographique |
| logo | Image | Logo |
| path | Text | Chemin URL unique |
| siret | Text | Numéro SIRET |
| owner | -> User | Propriétaire |
| availability | -> availability | Disponibilités/horaires |
| landing_page | -> landing page | Configuration du site web |
| subscription | -> Subscription | Abonnement actif |
| ID_stripe_connect | Text | ID Stripe Connect |
| ID_subscription | Text | ID abonnement Stripe |
| sub_active? | Boolean | Abonnement actif |

#### availability (Disponibilités du magasin)

| Champ | Type | Description |
|-------|------|-------------|
| Opening_hour | Date | Heure d'ouverture |
| Closing_hour | Date | Heure de fermeture |
| minimum_date | Date | Date minimum de réservation (début saison) |
| maximum_date | Date | Date maximum de réservation (fin saison) |
| monday - sunday | Boolean (défaut: true) | Jours d'ouverture (7 champs) |
| unavailable dates | List of Date | Dates d'indisponibilité ponctuelle |

#### Brand (Marque)

| Champ | Type | Description |
|-------|------|-------------|
| name | Text | Nom de la marque |
| searchField | Text | Champ de recherche |
| shop | List of -> shop | Magasins utilisant cette marque (N:N) |

#### ProductModel (Modèle de produit)

| Champ | Type | Description |
|-------|------|-------------|
| name | Text | Nom du modèle |
| description | Text | Description |
| image | Image | Photo |
| brand | -> Brand | Marque |
| type | Option: Type | Type d'équipement |
| shopPrice | Number | Prix en magasin (par jour) |
| webPrice | Number | Prix en ligne (par jour) |
| quantity | Number | Quantité totale |
| searchField | Text | Champ de recherche |
| shop | -> shop | Magasin propriétaire |

#### Product Variant (Variante de produit)

| Champ | Type | Description |
|-------|------|-------------|
| productModel | -> ProductModel | Modèle parent |
| size | Number | Taille |
| quantity | Number | Quantité en stock |
| searchField | Text | Champ de recherche |
| shop | -> shop | Magasin |

#### itemUnit (Unité physique individuelle)

| Champ | Type | Description |
|-------|------|-------------|
| productVariant | -> Product Variant | Variante associée |
| barcode | Text | Code-barres / numéro de série |
| size | Text | Taille |
| condition | Option: Condition | État (Neuf → Satisfaisant) |
| status | Option: Status | Statut (Disponible, Maintenance, Cassé, À enregistrer) |
| last_used | Date | Dernière utilisation |
| shop | -> shop | Magasin |

#### Pack

| Champ | Type | Description |
|-------|------|-------------|
| name | Text | Nom du pack |
| description | Text | Description |
| type | Option: Type | Type d'équipement |
| searchField | Text | Champ de recherche |
| shop | -> shop | Magasin |

#### PackedProduct (Produit dans un pack)

| Champ | Type | Description |
|-------|------|-------------|
| pack | -> Pack | Pack parent |
| productModel | -> ProductModel | Modèle de produit |
| isOption? | Boolean (défaut: false) | Produit optionnel dans le pack |
| shopPrice | Number | Prix magasin |
| webPrice | Number | Prix web |
| shop | -> shop | Magasin |

#### Client

| Champ | Type | Description |
|-------|------|-------------|
| firstName | Text | Prénom |
| lastName | Text | Nom |
| email | Text | Email |
| phone | Text | Téléphone |
| address | Geographic address | Adresse |
| shop | -> shop | Magasin |

#### Participant

| Champ | Type | Description |
|-------|------|-------------|
| firstName | Text | Prénom |
| height | Number | Taille (cm) |
| weight | Number | Poids (kg) |
| shoeSize | Number | Pointure |
| isValidate? | Boolean | Validé |
| reservation | -> Reservation | Réservation associée |
| total_amount | Number | Montant total |
| shop | -> shop | Magasin |

#### Reservation

| Champ | Type | Description |
|-------|------|-------------|
| reservation_ID | Text | Identifiant unique |
| startDate | Date | Date de début |
| endDate | Date | Date de fin |
| Arrival_time | Date | Heure d'arrivée |
| status | Option: Statut reservation | Statut |
| client | -> Client | Client |
| shop | -> shop | Magasin |
| promoCode | -> Promotion | Code promo appliqué |
| totalAmount | Number | Montant total |
| amount_promo | Number | Montant de la réduction |
| isPaid? | Boolean (défaut: false) | Paiement effectué |
| isReadyNotification? | Boolean (défaut: false) | Notification "prêt" envoyée |
| charge_ID | Text | ID de charge Stripe |
| payment_intent_ID | Text | ID Payment Intent Stripe |
| searchField | Text | Champ de recherche |

#### itemReserved (Article réservé)

| Champ | Type | Description |
|-------|------|-------------|
| reservation | -> Reservation | Réservation parente |
| participant | -> Participant | Participant concerné |
| productModel | -> ProductModel | Modèle de produit |
| itemUnit | -> itemUnit | Unité physique assignée |
| packedProduct | -> PackedProduct | Produit pack associé |
| startDate | Date | Date de début |
| endDate | Date | Date de fin |
| pricePerDay | Number | Prix par jour |
| totalPrice | Number | Prix total |
| isPack? | Boolean | Fait partie d'un pack |
| isDraft? | Boolean (défaut: false) | Brouillon (panier non validé) |
| shop | -> shop | Magasin |

#### Promotion

| Champ | Type | Description |
|-------|------|-------------|
| code | Text | Code promotionnel |
| description | Text | Description |
| percentage | Number | Pourcentage de réduction |
| startDate | Date | Date de début de validité |
| endDate | Date | Date de fin de validité |
| deleted? | Boolean (défaut: false) | Suppression logique |
| searchField | Text | Champ de recherche |
| shop | -> shop | Magasin |

#### Subscription (Abonnement SaaS)

| Champ | Type | Description |
|-------|------|-------------|
| ID subscription | Text | ID abonnement Stripe |
| ID customer | Text | ID client Stripe |
| plan | Option: Plan | Plan souscrit |
| amount | Number | Montant |
| Active | Boolean | Actif |
| Cancel at | Date | Date d'annulation prévue |
| Cancel at period end | Boolean | Annulation en fin de période |
| User | -> User | Utilisateur |
| shop | -> shop | Magasin |

#### Reservation_Payment (Paiement de réservation)

| Champ | Type | Description |
|-------|------|-------------|
| amount | Number | Montant |
| type | Option: Type payment | Type (carte ou espèces) |
| ID Charge | Text | ID charge Stripe |
| payment_intent_id | Text | ID Payment Intent |
| receipt | Text | URL du reçu Stripe |
| invoice | File | Fichier facture PDF |
| reservation | -> Reservation | Réservation |
| client | -> Client | Client |
| shop | -> shop | Magasin |

#### subscription_Payment (Paiement d'abonnement)

| Champ | Type | Description |
|-------|------|-------------|
| amount | Number | Montant |
| billing reason | Text | Raison de facturation |
| ID Charge | Text | ID charge Stripe |
| ID customer | Text | ID client Stripe |
| ID invoice | Text | ID facture Stripe |
| invoice | File | Fichier facture |
| plan | Option: Plan | Plan |
| subscription | -> Subscription | Abonnement |
| user | -> User | Utilisateur |
| shop | -> shop | Magasin |

#### landing page (Configuration du site web)

| Champ | Type | Description |
|-------|------|-------------|
| hero_title | Text | Titre du hero |
| hero_subtitle | Text | Sous-titre du hero |
| hero_img | Image | Image du hero |
| section_about-text | Text | Texte "À propos" |
| section_about-img | Image | Image "À propos" |
| testimonial_img | Image | Image section témoignages |
| img_fb | Image | Image Open Graph |
| description_SEO | Text | Meta description |
| CGU | Text | Conditions Générales d'Utilisation |
| CGV | Text | Conditions Générales de Vente |
| condition_reservation | Text | Conditions de réservation |
| link_facebook | Text | Lien Facebook |
| link_google | Text | Lien Google |
| link_instagram | Text | Lien Instagram |
| LP_activities | List of -> LP_activities | Activités |
| Lp_category | List of -> LP_Category | Catégories |
| options | List of Options | Avantages activés |
| testimonials | List of -> LP_testimonials | Témoignages |

#### LP_activities / LP_Category / LP_testimonials

**Activités** : title, text, image, img_alt_tag
**Catégories** : name, title, text, image, img_alt_tag, type (Option: Type)
**Témoignages** : nom, avis, note (Number)

### 2.3 Carte des relations

```
                          ┌─────────────┐
                          │    User      │
                          └──────┬───────┘
                                 │ owner
                                 ▼
┌──────────┐              ┌──────────────┐              ┌───────────────┐
│availability│◄────────────│    shop      │─────────────►│ landing page  │
└──────────┘              └──────┬───────┘              └───┬───┬───┬───┘
                                 │                          │   │   │
                          ┌──────▼───────┐          activities categories testimonials
                          │ Subscription │                  ▼   ▼   ▼
                          └──────┬───────┘          LP_activities LP_Category LP_testimonials
                                 │
                          ┌──────▼───────┐
                          │sub_Payment   │
                          └──────────────┘

┌─────────┐         ┌──────────────┐         ┌───────────────┐
│  Brand   │◄────────│ ProductModel │◄────────│Product Variant│
└─────────┘         └──────┬───────┘         └───────┬───────┘
                           │                         │
                    ┌──────▼───────┐          ┌──────▼───────┐
                    │PackedProduct │          │   itemUnit    │
                    └──────┬───────┘          └──────┬───────┘
                           │                         │
                    ┌──────▼───────┐                 │
                    │     Pack     │                  │
                    └──────────────┘                  │
                                                     │
┌─────────┐         ┌──────────────┐          ┌──────▼───────┐
│ Client   │◄────────│ Reservation  │◄─────────│ itemReserved │
└─────────┘         └──────┬───────┘          └──────┬───────┘
                           │                         │
                    ┌──────▼───────┐          ┌──────▼───────┐
                    │  Promotion   │          │ Participant   │
                    └──────────────┘          └──────────────┘
                           │
                    ┌──────▼───────┐
                    │Reserv_Payment│
                    └──────────────┘
```

### 2.4 Option Sets (Énumérations)

#### Rôles utilisateur
- **App Admin** : Accès complet
- **Shop Owner** : Accès complet à son magasin
- **Shop Employee** : Accès limité (Dashboard, Réservations, Inventaire)

#### Navigation principale (Tabs)

| Tab | URL | Icône | Rôles |
|-----|-----|-------|-------|
| Dashboard | /dashboard | squares-four | Tous |
| Réservations | /reservation | calendar-plus | Tous |
| Inventaire | /inventory | package | Tous |
| Packs et prix | /pack_price | tag | Admin, Owner |
| Site web | /website | browser | Admin, Owner |
| Paramètres | /settings | gear | Admin, Owner |

#### Sous-tabs

| Sous-tab | Tab parent | URL |
|----------|-----------|-----|
| Stock global | Inventaire | /product |
| Unités spécifiques | Inventaire | /item_units |
| Packs | Packs et prix | /packs |
| Prix des modèles | Packs et prix | /model_price |
| Promotions | Packs et prix | /promo |
| Informations du magasin | Paramètres | /shop-info |
| Gestion des employés | Paramètres | /employee |
| Mon abonnement | Paramètres | /subscription |

#### Types d'équipement (spécifique ski dans Bubble, à généraliser)
Ski, Snow, Snow Scoot, Mini Ski, Raquettes, Casque, Chaussures Ski, Chaussures Snow

#### État du matériel (Condition)
Neuf → Très bon état → Bon état → Correct → Satisfaisant

#### Statut d'une unité
Disponible, Maintenance, Cassé, À enregistrer

#### Statut de réservation
Draft → À valider → À venir → Prête → En cours → Terminé / Annulé

#### Plans d'abonnement

| Plan | Prix | Intervalle | Description |
|------|------|-----------|-------------|
| Mensuel | 79€ | Mois | Sans engagement, 1 mois d'essai gratuit |
| Annuel | 790€ | An | 2 mois offerts + 1 mois d'essai |

#### Options commerciales (Landing page)
- Frais de dossier offerts
- Récupérer le matériel la veille à partir de 18h
- 7ème jour offert
- Annulation sans frais jusqu'à 24h avant
- Acompte de 20%
- Retour du matériel jusqu'à 10h le lendemain

#### Website Builder (Sections)
Header, Catégories, Avantages, Avis, Activités, L'équipe, Pages légales, SEO

---

## 3. Architecture des pages et flux utilisateur

### 3.1 Page `index` -- Landing page marketing Rentic

**Objectif** : Convertir les prospects (loueurs) en utilisateurs de Rentic.

**Sections** :
1. **Hero** : Topbar Rentic + titre "La Solution Tout-en-Un pour la Location Saisonnière" + sous-titre + CTA (Réserver un appel / Essai gratuit) + vidéo démo
2. **Features** : 4 fonctionnalités clés (Réservations en ligne, Gestion du stock, Site web pro, Tableau de bord)
3. **CTA** : Liste d'avantages (Gain de temps, Suivi précis, Site clé en main) + boutons d'action
4. **FAQ** : 6 questions fréquentes en accordéon
5. **Contact** : Formulaire (Nom, Email, Message)
6. **Footer Rentic**

### 3.2 Page `sign-in` -- Authentification

**Sections** :
- **Inscription** : Email/Password ou Google OAuth + vérification SIRET + confirmation email
- **Connexion** : Email/Password ou Google OAuth
- **Mot de passe oublié** : Reset par email
- **Indicateur de force** du mot de passe (5 critères)

### 3.3 Page `onboarding` -- Configuration initiale (3 étapes + abonnement)

| Étape | Contenu |
|-------|---------|
| 1. Informations personnelles | Photo, Nom, Prénom |
| 2. Informations du magasin | Logo, Nom, Téléphone, Email, Adresse, SIRET |
| 3. Horaires d'ouverture | Toggles par jour, heures ouverture/fermeture, dates de saison |
| 4. Abonnement | Sélection du plan → Stripe Checkout |

### 3.4 Page `app` -- Dashboard principal

**Layout** : Sidebar flottante + contenu central conditionnel

**Sidebar** :
- Logo "#Rentic"
- Menu dynamique (tabs + sous-tabs avec icônes, filtré par rôle)
- Notification de réservations en attente
- Paramètres utilisateur (photo, nom, édition profil, déconnexion)

**Sections conditionnelles** :

#### Dashboard (accueil)
- Bannière de bienvenue ("Bonjour, [nom]" + date)
- 4 métriques : Locations (saison), Réservations, Montant total, Promos actives
- Graphique de réservations (filtrable : semaine, mois, saison) via ChartJS
- 4 compteurs de statut : À venir, Prête, En cours, Terminé
- Barre d'actions : Nouvelle réservation, sélecteur dates, recherche
- Tableau des réservations récentes (Réf, Client, Dates, Statut, Montant)

#### Réservations
- Liste paginée avec filtres (recherche, dates, statut)
- Tableau : Référence, Client (tag), Dates, Heure d'arrivée, Statut (tag), Montant
- CRUD complet en 4 onglets :
  1. **Facturation** : Prénom, Nom, Email, Tél, Adresse, Heure d'arrivée
  2. **Participants** : Tableau (prénom, taille, poids, pointure, total) + ajout matériel
  3. **Matériel** : Attribution d'unités physiques (scan code-barres), changement statut (Prête, En cours)
  4. **Encaissement** : Récapitulatif, code promo, paiement CB/Espèces, renvoi facture, terminer

#### Inventaire > Stock global
- Tableau : Image, Modèle (nom+marque), Type, Taille (dropdown), Stock
- Filtres : recherche, taille, marque, type
- CRUD modèle en 2 onglets :
  1. **Détails** : Image, Nom, Marque (recherche/création), Type, Prix web, Prix magasin, Description
  2. **Variantes** : Tableau taille + stock avec boutons +/-, ajout de variantes

#### Inventaire > Unités spécifiques
- Tableau : Modèle, Code-barres (éditable), Taille, État (dropdown), Statut (dropdown), Dernière utilisation
- Filtres : recherche, taille, état, statut, marque, type

#### Packs & Prix > Packs
- Liste des packs avec filtres + panneau de détail :
  - En-tête (nom, description, type) avec stats (prix min web/magasin)
  - Modèles principaux : tableau avec ajout par recherche, prix éditables
  - Options : tableau similaire pour accessoires complémentaires

#### Packs & Prix > Prix des modèles
- Tableau : Modèle, Type, Prix web (éditable), Prix magasin (éditable)
- Filtres : recherche, prix, type, marque

#### Packs & Prix > Promotions
- Tableau : Code, Réduction (%), Description, Dates
- CRUD : Code, Pourcentage, Date range, Description

#### Site web (Website builder)
- Prévisualisation en direct (simulateur navigateur avec URL)
- Panneau d'édition flottant avec 8 onglets :
  1. **Header** : Titre, sous-titre, image hero
  2. **Catégories** : Image, type, nom, description par catégorie
  3. **Avantages** : Toggles on/off pour chaque avantage
  4. **Avis** : Image de fond + témoignages (note, nom, texte)
  5. **Activités** : Image, titre, description par activité
  6. **L'équipe** : Texte "à propos", image, alt SEO
  7. **Pages légales** : Éditeurs rich text (CGV, CGU, Conditions de réservation)
  8. **SEO** : Liens réseaux sociaux, meta description, image Open Graph

#### Paramètres > Infos magasin
- Compte Stripe Connect (création + lien dashboard)
- Informations générales : Logo, Nom, Tél, Email, Adresse, SIRET
- Disponibilités : Heures, dates de saison, toggles jours, dates d'indisponibilité

#### Paramètres > Employés
- Tableau : Nom, Email, Date création, Rôle
- Popup d'ajout : Nom, Prénom, Email (invitation par email)

#### Paramètres > Abonnement
- Mon plan : prix, dates, lien portail Stripe
- Mes factures : liste avec téléchargement

### 3.5 Page `shop` -- Vitrine publique du magasin

**Structure** :
1. **Topbar** : Logo, navigation (Équipement, Activités, Avantages, Avis), panier, menu mobile
2. **Hero** : Titre + sous-titre dynamiques, bloc réservation (logo, adresse, date picker, CTA "Étape suivante")
3. **Équipement** : "Découvrez toute notre gamme" + grille de cartes produits + popup détail avec onglets par type
4. **Avantages** : 6 blocs configurables (acompte, frais offerts, 7ème jour, no stress, annulation, récupération veille)
5. **Témoignages** : Note moyenne + carousel d'avis (étoiles + texte)
6. **Activités** : Grille de cartes (image + titre + description)
7. **À propos** : Photo d'équipe + texte + liens réseaux sociaux
8. **Carte** : Google Maps avec localisation du magasin
9. **Footer** : Coordonnées, réseaux sociaux, liens, légal, "Made with love by Rentic"
10. **Cookie banner**

### 3.6 Page `reservation` -- Tunnel de réservation client

**Structure** :
1. **Bannière** : Topbar + sélecteur de dates + compteur panier
2. **Sélection** :
   - Toggle Packs / Modèles individuels
   - Filtrage par type (onglets)
   - **Vue Packs** : Cartes avec image, prix, options configurables, bouton "Ajouter"
   - **Vue Modèles** : Cartes simples avec image, prix, bouton "Ajouter"
3. **Popup Panier** :
   - Liste des participants (nom pack, bouton supprimer, champs taille/poids/pointure, tags équipements, sous-total)
   - Récapitulatif (prix web, montant promo, heure d'arrivée, total)
   - Champ code promo
   - Bouton "Valider"
4. **Bouton mobile panier** (responsive)

### 3.7 Page `invoice` -- Facture

- En-tête : infos loueur (nom, adresse, SIRET) + infos client
- Tableau par participant : en-tête, détails morphologiques, équipements (modèle, marque, prix unitaire, total)
- Pied : Total, Montant promo, Total Général

### 3.8 Pages secondaires

- **404** : Animation + message + bouton retour
- **email-confirmed** : Confirmation + redirection onboarding
- **reset_pw** : Nouveau mot de passe + indicateur de force
- **confidentialite** / **mentions-legales** : Pages légales de Rentic
- **legal** : Pages légales dynamiques du magasin (CGV, CGU, Confidentialité, Conditions réservation, Cookies)

---

## 4. Flux de navigation

### Parcours loueur (B2B)

```
index → sign-in (inscription)
  → Saisie SIRET
  → Vérification email → email-confirmed
  → onboarding (3 étapes + abonnement)
  → app (dashboard)

sign-in (connexion) → app
  Sidebar → Dashboard | Réservations | Inventaire | Packs&Prix | Site web | Paramètres
  User settings → Modifier profil | Déconnexion
```

### Parcours client (B2C)

```
shop (vitrine) → Sélection dates → reservation (choix matériel)
  → Ajout packs/modèles au panier
  → Panier (participants, infos morphologiques, code promo)
  → Validation → Stripe Checkout → Confirmation + facture par email
```

---

## 5. Logique métier et workflows

### 5.1 Workflows backend (35 au total)

#### Inscription & Onboarding

| Workflow | Rôle |
|----------|------|
| SEND CONFIRMATION-Email | Génère un token et envoie un email de vérification via Loops |
| 00 - CREATE SHOP | Crée landing page + availability + shop, puis planifie la création du contenu par défaut |
| 01 - CREATE LP-ACTIVITIES | Crée récursivement les activités par défaut |
| 02 - CREATE LP-CATEGORIES | Crée récursivement les catégories par défaut |
| 03 - CREATE LP-TESTIMONIALS | Crée récursivement les témoignages par défaut |
| CREATE NEW EMPLOYEE | Crée un compte employé + envoi email d'invitation via Loops |

#### Réservation

| Workflow | Rôle |
|----------|------|
| CREATE Each itemReserved [PACK] | Crée récursivement un itemReserved par produit du pack |
| DELETE Participant | Supprime un participant + tous ses itemReserved |
| DELETE Reservation | Suppression en cascade : Client, Participants, itemReserved, Reservation |

#### Inventaire

| Workflow | Rôle |
|----------|------|
| CREATE [itemUNIT] | Crée récursivement les unités physiques jusqu'à la quantité cible |
| DELETE [itemUNIT] | Supprime toutes les unités d'une liste de variantes |
| DELETE [ProductVARIANT] | Supprime toutes les variantes d'un modèle |

#### Stripe - Abonnement boutique

| Webhook | Événement Stripe | Action |
|---------|-----------------|--------|
| checkout-session | checkout.session.completed | Crée Subscription, lie shop et user |
| invoice-paid | invoice.paid | Crée subscription_Payment, email reçu via Loops |
| customer-subscription-deleted | customer.subscription.deleted | Désactive shop, supprime subscription, email adieu |
| trial-will-end | customer.subscription.trial_will_end | Notification fin d'essai |
| subscription update | customer.subscription.updated | Met à jour plan |

#### Stripe - Paiement client (Connect)

| Webhook | Action |
|---------|--------|
| stripe-connect-sale | GET/CREATE Client → MAJ Reservation (paiement) → Schedule création facture |
| GET/CREATE Client | Upsert client par email |
| CREATE Invoice | Génère PDF (SelectPDF), crée Reservation_Payment, email confirmation via Loops |

#### Database Triggers (automatisations)

| Trigger | Table | Condition | Action |
|---------|-------|-----------|--------|
| UPDATE Owner info | User | Changement nom/prénom | Sync Stripe Connect |
| DELETE Old profile IMG | User | Changement image | Supprime ancien fichier |
| Update logo | shop | Changement logo | MAJ branding Stripe |
| DELETE Old logo | shop | Changement logo | Supprime ancien |
| Email modify info | shop | Changement adresse | Alerte MAJ Stripe manuelle |
| 5x Delete OLD IMG | landing page, LP_Category | Changement image | Nettoyage fichiers |
| DELETE ProductModel Image | ProductModel | Changement image | Nettoyage |
| UPDATE Participant Info | Participant | Changement taille | MAJ infos dérivées |

### 5.2 Flux de réservation détaillé

**Côté client** :
1. Client arrive sur `shop`, sélectionne ses dates
2. Redirigé vers `reservation` avec dates en cookie
3. Choisit entre packs et modèles individuels, filtre par type
4. Ajoute des articles au panier (création d'itemReserved avec isDraft=true)
5. Ouvre le panier, renseigne les participants (taille, poids, pointure)
6. Applique un code promo optionnel, choisit l'heure d'arrivée
7. Valide → Session Stripe Checkout (mode payment, compte Connect du magasin)
8. Paie sur Stripe → Webhook `stripe-connect-sale`
9. Backend : GET/CREATE Client → MAJ Reservation → Schedule Invoice
10. Génération PDF facture → Email confirmation au client (Loops)

**Côté propriétaire** :
1. Voit la réservation dans la liste (statut "À valider")
2. Ouvre le CRUD, peut modifier les infos client
3. Ajoute/modifie les participants et l'équipement
4. Assigne des unités physiques spécifiques (scan code-barres)
5. Change le statut : Prête → En cours → Terminé
6. Peut encaisser par CB (Stripe) ou Espèces
7. Peut renvoyer la facture, terminer la réservation

### 5.3 Hiérarchie d'inventaire

```
ProductModel (ex: "Ski Rossignol Hero")
  └── Product Variant (ex: "Taille 170cm", stock: 5)
       └── itemUnit #1 (code-barres: SKI-001, état: Neuf, statut: Disponible)
       └── itemUnit #2 (code-barres: SKI-002, état: Bon, statut: En maintenance)
       └── ...
```

- Double tarification : `webPrice` (en ligne) et `shopPrice` (en magasin) sur chaque modèle
- Création récursive des unités physiques (pattern Schedule API Workflow)
- Suppression en cascade : Modèle → Variantes → Unités

### 5.4 Règles métier clés

1. **Isolation multi-tenant** : Toutes les données sont scopées par `shop`
2. **Double tarification** : Prix web ≠ Prix magasin pour chaque produit
3. **Packs avec options** : Produits obligatoires + produits optionnels dans un pack
4. **Suppression en cascade** : Reservation → Participants → itemReserved → Client
5. **Statuts de réservation** : Cycle de vie complet (Draft → Terminé/Annulé)
6. **Nettoyage fichiers** : 8 triggers pour supprimer les anciens uploads
7. **Sync Stripe automatique** : Changements user/shop propagés vers Stripe Connect
8. **Vérification IP webhooks** : Liste blanche d'IPs Stripe
9. **Roles et permissions** : Employee limité à Dashboard + Réservations + Inventaire
10. **Onboarding orchestré** : Création shop déclenche toute la chaîne de setup

---

## 6. Intégrations externes

| Service | Usage |
|---------|-------|
| **Stripe** | Abonnements SaaS (Subscriptions) + Paiements clients (Connect, mode payment) |
| **Stripe Connect** | Chaque magasin a un compte Express pour recevoir les paiements |
| **Loops** | Emails transactionnels (confirmation, reçus, invitations, notifications) |
| **SelectPDF** | Génération de factures PDF |
| **Google OAuth** | Connexion sociale |
| **Google Maps** | Localisation du magasin sur la vitrine |
| **ChartJS** | Graphiques du dashboard |

---

## 7. Points clés pour la réécriture en code

### Ce qui fonctionne bien et à conserver
- Architecture multi-tenant centrée sur `shop`
- Hiérarchie produit à 4 niveaux (Brand → Model → Variant → Unit)
- Système de packs avec options
- Double tarification web/magasin
- Website builder intégré avec prévisualisation
- Cycle de vie complet des réservations
- Gestion des participants avec données morphologiques
- Système de rôles (Owner/Employee)
- Onboarding guidé en 3 étapes

### Ce qui doit être généralisé (ski → tout type de location)
- **Types d'équipement** : Remplacer les types ski codés en dur par un système configurable
- **Données participant** : Rendre les champs morphologiques (taille, poids, pointure) configurables par type de produit (ex: pour un VTT → taille du cycliste, pour un paddle → poids)
- **Avantages** : Les 6 options commerciales sont codées en dur → les rendre personnalisables
- **Catégories landing page** : Liées à un type d'équipement fixe → rendre dynamique

### Améliorations suggérées
- Calcul de disponibilité en temps réel (pas visible dans l'app Bubble actuelle)
- Système de notifications plus riche (push, SMS)
- Gestion des tarifs dégressifs (semaine, saison)
- Système de champs personnalisables par produit pour les infos client
- Multi-langue
- Mode hors-ligne pour la gestion en magasin
