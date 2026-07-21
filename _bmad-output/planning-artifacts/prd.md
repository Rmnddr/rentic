---
stepsCompleted: [step-01-init, step-02-discovery, step-02b-vision, step-02c-executive-summary, step-03-success, step-04-journeys, step-05-domain-skipped, step-06-innovation, step-07-project-type, step-08-scoping, step-09-functional, step-10-nonfunctional, step-11-polish, step-12-complete]
inputDocuments:
  - docs/bubble-app-analysis.md
  - docs/prd-v3.md
  - _bmad-output/planning-artifacts/research/market-saas-location-saisonniere-research-2026-02-26.md
workflowType: 'prd'
documentCounts:
  briefs: 0
  research: 1
  brainstorming: 0
  projectDocs: 2
classification:
  projectType: saas_b2b
  domain: general
  complexity: medium
  projectContext: brownfield
---

# Product Requirements Document - Rentic

**Author:** Romain
**Date:** 2026-02-26

## Executive Summary

Rentic est une plateforme SaaS B2B2C tout-en-un destinée aux commerces de location saisonnière d'équipements sportifs et de loisirs (ski, VTT, surf, paddle, kayak, etc.). Elle permet à un loueur de créer son site web professionnel, prendre des réservations en ligne 24/7, gérer son stock unitaire en temps réel, encaisser les paiements, et piloter son activité grâce à un assistant IA — le tout depuis un seul outil, opérationnel en 15 minutes.

**Problème** : Les ~300 loueurs indépendants en France gèrent leur activité avec Excel, du papier et le téléphone. 70% des locations se font encore sur place. Ils n'ont ni site web professionnel, ni réservation en ligne, ni visibilité sur leur stock. Les solutions existantes sont soit trop lourdes et coûteuses (Skilou, Wintersteiger), soit généralistes et inadaptées au métier du loueur sportif (Booqable, TWICE). Aucune ne combine gestion + site web + multi-sport + IA dans un seul outil.

**Solution** : Rentic occupe le quadrant vide du marché — spécialisé sport ET simple. Le loueur configure ses propres catégories, attributs produit et attributs participant (taille du ski ≠ poids pour le paddle), crée des packs personnalisés (ski + chaussures + bâtons), et publie son site web avec tunnel de réservation intégré. L'IA connectée au stock conseille le loueur sur les promos et l'optimisation de son activité.

**Cible** : Loueurs indépendants d'équipements sportifs saisonniers en France. Démarrage local (Pyrénées, 2-3 stations), puis expansion montagnes + côtes atlantique et méditerranéenne.

**Modèle** : Abonnement Saison (450€) ou Annuel (790€/an, tarif incitatif vs saison). 1 mois d'essai gratuit. Paiement client via Stripe Connect (le loueur encaisse directement).

### What Makes This Special

1. **La boucle complète en 15 minutes** : Site web en ligne → premières réservations dans le dashboard → gestion fluide du stock et des packs → IA qui conseille sur les promos et le marketing. Pas une feature isolée, mais l'enchaînement qui transforme un loueur "papier" en business digital.

2. **Attributs personnalisables par catégorie** : Le loueur définit ses propres champs produit et participant. Un loueur ski demande la pointure, un loueur paddle demande le poids — sans changer une ligne de code. Architecture unique, pas un simple toggle.

3. **L'IA comme conseiller business** : À l'ère de l'IA, Rentic ne se contente pas de gérer — il aide à vendre. L'assistant analyse le stock sous-performant, suggère des promos, aide au marketing et à la présence en ligne. C'est le premier outil de ce type à intégrer l'IA dans le pilotage d'activité d'un loueur.

4. **Made in France, pour les TPE françaises** : Produit français, support en français, pensé pour des structures de 1-5 personnes en saison. Pricing transparent, onboarding en 15 min, interface sans formation.

## Project Classification

| Attribut | Valeur |
|----------|--------|
| **Type** | SaaS B2B (avec composante B2C pour le site public du loueur) |
| **Domaine** | Gestion de location d'équipements / Commerce saisonnier |
| **Complexité** | Moyenne — multi-tenant avec RLS, double flux Stripe, attributs dynamiques, website builder, IA |
| **Contexte** | Brownfield — réécriture et généralisation d'une app Bubble existante (rentic-65966) |
| **Stack** | Next.js 15, Supabase (PostgreSQL + Auth + Storage), shadcn/ui, Stripe, Claude AI, Vercel |

## Success Criteria

### User Success

| Critère | Mesure | Cible |
|---------|--------|-------|
| **Onboarding éclair** | Temps entre inscription et site web en ligne | < 15 minutes |
| **Première réservation en ligne** | Délai entre mise en ligne et première réservation reçue | < 7 jours |
| **Zéro double-booking** | Conflits de réservation sur le même matériel | 0% |
| **Gain de temps quotidien** | Réduction du temps de gestion (avant/après) | -50% |
| **Autonomie** | % de loueurs capables de configurer seuls (sans support) | > 90% |
| **Moment "aha!"** | Le loueur voit sa première réservation en ligne apparaître dans son dashboard — confirmation que ça fonctionne | Qualitatif |

### Business Success

| Critère | 3 mois | 12 mois |
|---------|--------|---------|
| **Loueurs actifs (payants)** | 5-10 | 50 |
| **MRR** | 400-800€ | 5 000€ |
| **Churn mensuel** | < 8% (phase découverte) | < 5% |
| **Taux conversion essai → payant** | 15% | 20%+ |
| **CAC** | < 300€ (démarchage local) | < 200€ |
| **LTV/CAC** | > 2 | > 3 |
| **NPS loueurs** | > 30 | > 50 |

### Technical Success

| Critère | Cible |
|---------|-------|
| **Temps de chargement (LCP)** | < 2s |
| **Uptime** | 99.9% |
| **Temps de réponse API (p95)** | < 500ms |
| **Score Lighthouse** | > 90 (performance, accessibility, SEO) |
| **Zéro perte de données** | Isolation de données + backups automatiques |
| **Paiements fiables** | 100% des paiements en ligne correctement réconciliés |

### Measurable Outcomes

- Un loueur passe de "Excel + téléphone" à "site en ligne + réservations + dashboard" en une seule session
- Le panier moyen des réservations en ligne est supérieur de 15%+ au panier en magasin (effet packs + upsell)
- L'IA génère au moins 2 suggestions de promos pertinentes par mois par loueur actif
- 40%+ des réservations d'un loueur actif depuis 3 mois passent par le canal en ligne (vs 0% avant)

## Product Scope & MVP Strategy

### Stratégie MVP — Lean & Focused

**Philosophie** : Livrer la boucle complète minimale — un loueur peut s'inscrire, configurer son catalogue, publier son site, et recevoir des réservations payées en ligne. Tout le reste vient après validation du product-market fit.

**Approche** : MVP strict. Chaque feature doit répondre à la question "est-ce que le loueur peut louer en ligne sans ça ?". Si la réponse est non → MVP. Si la réponse est oui → post-MVP.

### MVP Feature Set (Phase 1 — Launch)

| Module | Features MVP | Exclues du MVP |
|--------|-------------|----------------|
| **Auth & Onboarding** | Email/password, onboarding 3 étapes (profil → magasin → première catégorie) | Google OAuth (compliance à évaluer), magic link |
| **Catalogue** | Catégories, attributs personnalisables (produit + participant), produits, unités physiques, marques | Templates de catégories par secteur |
| **Réservations** | CRUD complet, 4 onglets (à venir/en cours/passées/annulées), cycle de vie, réservation manuelle, paiement espèces, tunnel basé sur la disponibilité par dates | Scan code-barres, assignation unitaire |
| **Packs** | Création de packs (produits obligatoires/optionnels), prix spécifiques par item, sélection dans le tunnel | — |
| **Site web** | Landing page builder (hero, sections, infos), tunnel de réservation intégré | Thèmes multiples, éditeur drag-and-drop avancé |
| **Paiements** | Stripe Connect Express (client → loueur), Stripe Subscriptions (loueur → Rentic) | Virements SEPA, paiement en plusieurs fois |
| **Abonnement** | 2 plans (Saison 450€ / Annuel 790€), essai 1 mois, gestion cycle de vie | Coupons admin, plans custom |
| **Dashboard** | Métriques de base (réservations, CA, taux occupation) | Graphiques avancés, comparaison périodes |
| **Facturation** | PDF automatique avec mentions légales, envoi par email (Resend) | Export comptable, avoir/remboursement partiel |
| **Employés** | Invitation par email, rôle owner/employee, permissions | Rôles custom, audit log |
| **Infrastructure** | ISR pages publiques, RLS Supabase, Sentry, Vercel | PWA, notifications push, multi-langue |

### Post-MVP Features

**Phase 2 — Promotions & Optimisation** (après validation PMF)
- Codes promo (pourcentage/montant fixe, dates, limites)
- Tableau de prix éditable en masse
- Templates de catégories par secteur (ski, VTT, nautique)

**Phase 3 — Intelligence & Insights** (après base utilisateurs active)
- Assistant IA (chat avec tool use, connecté au stock et aux réservations)
- Suggestions de promos automatiques par l'IA
- Aide au marketing et présence en ligne
- Dashboard analytics avancé (comparaison, tendances, prévisions)

**Phase 4 — Scale & Expansion**
- Google OAuth (après évaluation compliance)
- Multi-langue (FR/EN)
- Notifications push / SMS
- Tarifs dégressifs (semaine, saison)
- PWA / app mobile
- Marketplace de loueurs
- Expansion internationale

### Risk Mitigation Strategy

| Risque | Probabilité | Impact | Mitigation |
|--------|------------|--------|-----------|
| **Coûts Vercel en haute saison** | Moyenne | Moyen | ISR agressif sur pages publiques (95% CDN), monitoring actif des coûts |
| **Adoption lente (marché TPE)** | Haute | Élevé | Démarrage local (Pyrénées, 2-3 loueurs), démarchage terrain, onboarding assisté |
| **Stripe Connect complexité** | Moyenne | Élevé | Implémenter le flux minimum (Express), itérer sur les edge cases après premiers clients |
| **Google OAuth compliance** | Moyenne | Faible | Reporté post-MVP — email/password suffisant pour le lancement |
| **Concurrence (Lokki, Booqable)** | Faible | Moyen | Différenciation par la spécialisation sport + attributs dynamiques + IA (Phase 3) |
| **Churn saisonnier** | Haute | Élevé | Plan Annuel incitatif (790€ vs 450€ saison), argument SEO 12 mois |

## User Journeys

### Journey 1 : Jean, loueur de ski à Cauterets — Le passage au digital

**Opening Scene** : Jean, 38 ans, gère 100+ paires de ski dans sa boutique à Cauterets. C'est février, vacances scolaires. Il est 8h30, 15 personnes attendent devant le magasin. Son cahier de réservations est illisible, il a 3 appels en absence, et il vient de réaliser qu'il a promis les mêmes chaussures taille 42 à deux familles différentes. Sa femme lui dit depuis 2 ans "t'as besoin d'un truc en ligne".

**Rising Action** : En mai, saison terminée, Jean tombe sur Rentic en cherchant "logiciel location ski" sur Google. Il s'inscrit, entre son SIRET, et lance l'onboarding. En 15 minutes, il a configuré son profil, son magasin, ses horaires de saison. Il crée ses catégories (Ski alpin, Chaussures, Casque, Bâtons), définit les attributs (taille en cm, pointure, poids pour le réglage DIN). Il ajoute ses produits avec les prix web et magasin. Son site est en ligne.

Il compose ses packs : "Pack Ski Complet" (ski + chaussures + bâtons, casque en option). Il teste le tunnel de réservation depuis son téléphone — ça marche. Il partage le lien sur sa page Facebook.

**Climax** : Octobre. La saison approche. Jean reçoit sa première réservation en ligne : une famille de 4, arrivée le 21 décembre. Il voit dans son dashboard les tailles, poids et pointures de chaque participant. Il peut préparer le matériel 2 jours avant leur arrivée. Quand la famille arrive, tout est prêt. Pas d'attente, pas d'erreur. La mère lui dit "c'est la première fois que c'est aussi rapide".

**Resolution** : En fin de saison, Jean a reçu 120 réservations en ligne (vs 0 l'année précédente). Son dashboard montre un CA en hausse de 25%. Il n'a eu aucun double-booking. Il renouvelle son abonnement sans hésiter.

**Capabilities révélées** : Auth + onboarding, catégories + attributs, produits + unités, packs, site web, tunnel de réservation, dashboard, facturation.

---

### Journey 2 : Sophie, vacancière — La réservation en 5 minutes

**Opening Scene** : Sophie, 32 ans, prépare ses vacances au ski avec son mari et ses 2 enfants (8 et 12 ans). Elle est sur son canapé à Toulouse, le départ c'est dans 3 semaines. Elle cherche "location ski Cauterets" sur Google et tombe sur le site de Jean (propulsé par Rentic).

**Rising Action** : Le site est pro. Elle voit les catégories, les prix, les avis clients. Elle sélectionne ses dates (21-28 décembre), puis choisit 2 "Pack Ski Complet" adulte + 2 "Pack Ski Complet" enfant. Elle ajoute des casques en option pour tout le monde. Pour chaque participant (Sophie, Thomas, Emma, Lucas), elle renseigne le prénom, la taille, le poids et la pointure. Un code promo "NOEL10" lui donne -10%.

**Climax** : Elle paie en ligne via Stripe. Confirmation instantanée par email avec facture PDF. Le 21 décembre, ils arrivent au magasin — le matériel est prêt, aux bonnes tailles. Pas de file d'attente. Les enfants sont sur les pistes en 10 minutes.

**Resolution** : Sophie laisse un avis 5 étoiles sur le site de Jean. L'année suivante, elle réserve directement — elle est déjà cliente, ses infos sont pré-remplies.

**Capabilities révélées** : Site public (landing page), tunnel de réservation (packs/individuel), attributs participant dynamiques, paiement Stripe Connect, facture PDF, email confirmation, code promo, base clients.

---

### Journey 3 : Léa, loueur de paddle à Biarritz — Le multi-sport qui fonctionne

**Opening Scene** : Léa, 30 ans, loue des paddles et combinaisons sur la Côte des Basques. Elle a 20 paddles rigides, 10 gonflables, 15 combinaisons et 20 gilets. Ses critères ne sont pas les mêmes que le ski : elle a besoin du poids des clients (sécurité), pas de leur pointure. Elle a testé Skilou — c'est pour le ski, impossible de configurer "paddle". Elle a testé Booqable — c'est en anglais et ne gère pas les participants.

**Rising Action** : Léa découvre Rentic. Elle crée ses catégories : "Paddle rigide", "Paddle gonflable", "Combinaison", "Gilet". Pour chaque catégorie, elle définit ses propres attributs. Pour les paddles, l'attribut participant est "Poids (kg)" (obligatoire pour la sécurité). Pour les combinaisons, c'est "Taille" (S/M/L/XL). Pas de pointure, pas de "taille ski en cm" — juste ce dont elle a besoin.

Elle crée un "Pack Paddle Découverte" : paddle gonflable + gilet (obligatoires) + combinaison (optionnelle). Son site est en ligne, avec ses photos de la plage en hero.

**Climax** : Mi-juillet, un mercredi matin pluvieux. 5 paddles sont disponibles sur 20 — la saison tourne bien. Mais le mercredi, c'est traditionnellement calme. L'IA de Rentic lui suggère : "Tes paddles gonflables ont un taux d'utilisation de 40% les mercredis. Suggestion : promo -20% le mercredi avec le code MIDWEEK." Léa valide en un clic. Elle partage sur Instagram. Le mercredi suivant, 3 réservations supplémentaires.

**Resolution** : Léa finit sa saison avec un taux d'utilisation de 75% (vs 55% l'an passé). L'IA l'a aidée à combler les creux. Elle envisage d'ajouter des kayaks pour la saison prochaine — il lui suffit de créer une nouvelle catégorie.

**Capabilities révélées** : Attributs personnalisables multi-sport, packs avec options, assistant IA (analyse stock + suggestion promos), site web personnalisé, flexibilité des catégories.

---

### Journey 4 : Marie, employée saisonnière de Jean — L'opérationnel au quotidien

**Opening Scene** : Marie, 22 ans, est saisonnière chez Jean. C'est son premier jour. Jean lui crée un compte employé en 30 secondes (invitation par email). Marie se connecte et voit le dashboard avec les réservations du jour.

**Rising Action** : Une famille arrive — réservation confirmée. Marie ouvre la fiche, voit les participants avec tailles/poids/pointures. Elle va chercher le matériel préparé, scanne les codes-barres pour assigner les unités physiques. Le statut passe à "En cours". En fin de journée, la famille rend le matériel. Marie scanne les retours, passe la réservation en "Terminé". Les unités redeviennent disponibles.

Un client arrive sans réservation. Marie crée une réservation manuelle depuis le back-office, renseigne le client, ajoute l'équipement, encaisse en espèces. Tout est dans le système.

**Climax** : Marie n'a pas accès aux packs, aux prix, au site web ni aux paramètres — c'est normal, elle est Employee. Mais elle gère parfaitement les réservations et l'inventaire. Jean peut partir déjeuner tranquille.

**Resolution** : En 1 jour, Marie est autonome. Pas de formation longue, l'interface est intuitive. La saison suivante, une nouvelle saisonnière prend le relais aussi facilement.

**Capabilities révélées** : Rôles (owner/employee), invitation par email, CRUD réservations, scan code-barres, assignation d'unités, paiement espèces, permissions limitées.

---

### Journey 5 : Romain (admin Rentic) — Le pilotage de la plateforme

**Opening Scene** : Romain, fondateur de Rentic, surveille la plateforme. 15 loueurs sont actifs. Il a besoin de visibilité sur les abonnements, les paiements, et la santé de la plateforme.

**Rising Action** : Via le dashboard Stripe, il suit les MRR, les essais en cours, les churns. Les webhooks Stripe sont fiables — chaque paiement d'abonnement est enregistré dans `subscription_payments`. Un loueur signale un problème de paiement client. Romain consulte les logs Stripe Connect pour identifier le souci (carte refusée côté client).

Un nouvel inscrit abandonne l'onboarding à l'étape 2. Romain le voit via l'analytics (profil avec `is_onboarded = false`, `onboarding_step = 2`). Il envoie un email de relance.

**Climax** : Un loueur VTT demande un attribut de type "fourchette de prix" (range). Le système ne le supporte pas encore (text/number/select uniquement). Romain note la demande pour la prochaine itération.

**Resolution** : Romain a une vision claire de la santé de la plateforme via Stripe Dashboard + Sentry + Vercel Analytics. Les retours utilisateurs alimentent la roadmap.

**Capabilities révélées** : Webhooks Stripe (subscriptions), monitoring (Sentry), analytics, gestion des abonnements, onboarding tracking, feedback loop.

---

### Journey Requirements Summary

| Journey | Capabilities révélées |
|---------|----------------------|
| **Jean (loueur ski)** | Auth, onboarding, catégories + attributs, produits + unités, packs, site web, tunnel réservation, dashboard, facturation |
| **Sophie (cliente)** | Site public, tunnel réservation, attributs participant, paiement Stripe Connect, facture PDF, email, code promo, base clients |
| **Léa (loueur paddle)** | Attributs multi-sport, packs avec options, assistant IA, site web personnalisé, flexibilité catégories |
| **Marie (employée)** | Rôles owner/employee, invitation email, CRUD réservations, scan code-barres, assignation unités, paiement espèces |
| **Romain (admin)** | Webhooks Stripe, monitoring, analytics, gestion abonnements, onboarding tracking |

**Couverture complète** :
- Primary user success path (Jean)
- End-user / client B2C (Sophie)
- Primary user multi-sport + IA (Léa)
- Secondary user / employee (Marie)
- Admin / operations (Romain)

## Innovation & Novel Patterns

### Detected Innovation Areas

**1. Combinaison inédite : Gestion + Site web + Multi-sport + IA**

Aucun acteur du marché ne propose ces 4 éléments dans un seul outil. C'est une innovation de combinaison (pas de technologie nouvelle, mais un assemblage inédit) :
- Les ERP ski (Skilou, Wintersteiger) gèrent mais n'ont ni site web ni multi-sport
- Les SaaS généralistes (Booqable, Lokki) ont un site web mais pas la spécialisation sport
- Personne n'intègre l'IA dans le pilotage d'un loueur saisonnier

**2. IA comme conseiller business pour les TPE (AI Agent)**

L'IA de Rentic n'est pas un chatbot générique — c'est un agent connecté aux données du magasin (stock, réservations, tendances) capable de :
- Identifier les produits sous-performants et suggérer des promos
- Analyser les tendances de réservation (jours creux, pics)
- Conseiller sur le marketing et la présence en ligne
- Aider à la décision d'investissement (ex: "dois-je acheter 5 VTT électriques ?")

C'est l'application du concept "AI agent" au métier du loueur saisonnier — un segment qui n'a jamais eu accès à ce type d'intelligence.

**3. Architecture d'attributs universels**

Le système `category_attributes` avec `applies_to` (product/participant) est une innovation architecturale qui rend le produit intrinsèquement universel. Ce n'est pas un simple "mode multi-sport" — c'est une architecture qui permet au loueur de définir son propre modèle de données sans code.

### Market Context & Competitive Landscape

- **Fenêtre de 12-24 mois** identifiée par la recherche de marché avant qu'un concurrent ne comble le gap
- Lokki (concurrent français le plus proche) n'a ni gestion de participants, ni packs sport, ni IA
- L'IA générative se démocratise — l'avantage first-mover est temporaire mais significatif à court terme
- Le marché hors-ski (VTT, nautique) est un **terrain vierge** sans leader SaaS

### Validation Approach

| Innovation | Méthode de validation | Critère de succès |
|-----------|----------------------|-------------------|
| Combinaison 4-en-1 | Taux de complétion onboarding (site en ligne en 15 min) | > 80% des inscrits terminent l'onboarding |
| IA conseiller | Taux d'adoption de l'IA par les loueurs actifs | > 50% des loueurs utilisent l'IA au moins 1x/semaine après 1 mois |
| Attributs universels | Nombre de catégories non-ski créées par les loueurs | > 30% des loueurs créent au moins 1 catégorie non-ski |

### Risk Mitigation

| Risque | Impact | Mitigation |
|--------|--------|-----------|
| L'IA n'apporte pas assez de valeur perçue | Le différenciateur principal tombe | Lancer le MVP sans IA (Phase 3), valider la boucle gestion + site web d'abord |
| Les attributs universels sont trop complexes pour les TPE | Onboarding bloqué, abandon | Templates pré-configurés par secteur (ski, VTT, nautique) pour démarrer en 1 clic |
| L'avantage first-mover IA est copié rapidement | Différenciation érodée en 12-18 mois | Intégrer l'IA profondément (pas juste un chatbot), accumuler les données d'usage pour entraîner des modèles spécifiques |
| La combinaison 4-en-1 dilue la qualité de chaque composante | Perception "touche-à-tout, bon à rien" | Focus MVP : gestion + packs + site web excellents, puis promos, puis IA |

## SaaS B2B Specific Requirements

### Project-Type Overview

Rentic est un SaaS B2B multi-tenant avec une couche B2C (site public du loueur). L'architecture est centrée sur l'entité `shop` qui assure l'isolation des données. Le modèle économique repose sur un abonnement SaaS (loueur → Rentic) et un flux de paiement transactionnel (client → loueur via Stripe Connect).

### Multi-Tenancy Model

**Approche** : Isolation logique par Row Level Security (RLS) Supabase.

- Toutes les tables métier contiennent une colonne `shop_id`
- Les politiques RLS garantissent qu'un utilisateur ne voit que les données de son shop
- Les données publiques (site du loueur) sont accessibles via des politiques SELECT spécifiques (`is_active = TRUE`)
- Pas de base de données séparée par tenant — un seul schéma PostgreSQL, RLS pour l'isolation

```sql
-- Pattern RLS appliqué à toutes les tables
CREATE POLICY "shop_isolation" ON {table}
  USING (shop_id IN (
    SELECT shop_id FROM profiles WHERE id = auth.uid()
  ));
```

**Données partagées entre tenants** :
- `brands` — marques référencées via une table pivot `shop_brands`
- `auth.users` — géré par Supabase Auth, lié à `profiles`

### RBAC Matrix

| Permission | Owner | Employee |
|-----------|-------|----------|
| Dashboard (lecture) | ✅ | ✅ |
| Réservations (CRUD) | ✅ | ✅ |
| Inventaire (lecture/édition) | ✅ | ✅ |
| Packs & Prix | ✅ | ❌ |
| Promotions | ✅ | ❌ |
| Site web (builder) | ✅ | ❌ |
| Paramètres magasin | ✅ | ❌ |
| Gestion employés | ✅ | ❌ |
| Abonnement | ✅ | ❌ |
| Assistant IA | ✅ | ❌ |

Implémentation : Le rôle est stocké dans `profiles.role` (`owner` / `employee`). Le middleware vérifie le rôle avant d'afficher les sections protégées. Les politiques RLS différencient `FOR SELECT` (tous les rôles) de `FOR ALL` (owner uniquement).

### Subscription Tiers

| Plan | Prix | Période | Essai | Site web |
|------|------|---------|-------|----------|
| **Saison** | 450€/saison | ~4-6 mois | 1 mois gratuit | Actif pendant la saison uniquement |
| **Annuel** | 790€/an | 12 mois | 1 mois gratuit | En ligne 12 mois (SEO, réservations anticipées) |

**Pas de tiers de fonctionnalités** — un seul niveau, tout inclus. La simplicité est un avantage compétitif. L'argument pour l'annuel : le site reste indexé par Google toute l'année, les vacanciers peuvent réserver des mois avant la saison.

**Cycle de vie abonnement** : `trialing` → `active` → `past_due` → `cancelled`

### Integration List

| Service | Rôle | Mode d'intégration |
|---------|------|-------------------|
| **Stripe Subscriptions** | Abonnements SaaS loueur → Rentic | Webhooks (checkout.session.completed, invoice.paid, subscription.updated/deleted, trial_will_end) |
| **Stripe Connect Express** | Paiements client → loueur | Webhooks (checkout.session.completed côté Connect) |
| **Supabase Auth** | Authentification | SDK client + middleware serveur |
| **Supabase Storage** | Stockage images/fichiers | SDK, buckets par type (logos, products, landing, invoices) |
| **Supabase Realtime** | Mises à jour temps réel (réservations) | Channels par shop_id |
| **Resend** | Emails transactionnels | API REST (confirmation, facture, invitation, fin d'essai) |
| **Claude API (Anthropic)** | Assistant IA avec tool use | SDK Anthropic, streaming, tools connectés aux données shop |
| **@react-pdf/renderer** | Génération factures PDF | Côté serveur (API route) |
| **Leaflet + OpenStreetMap** | Carte localisation magasin | Client-side, gratuit |
| **Sentry** | Monitoring erreurs et performance | SDK Next.js |
| **Vercel Analytics** | Analytics plateforme | Intégré au déploiement |

### Compliance Requirements

| Domaine | Exigence | Implémentation |
|---------|----------|---------------|
| **RGPD** | Consentement cookies, droit à l'effacement, portabilité | Banner cookies, suppression en cascade, export données |
| **Facturation** | Mentions obligatoires sur factures (SIRET, TVA, etc.) | Template PDF conforme |
| **CGV/CGU** | Conditions générales du loueur | Éditeur rich text dans le website builder |
| **Stripe PCI-DSS** | Sécurité des paiements | Géré par Stripe (pas de données carte côté serveur) |
| **Sécurité webhooks** | Vérification authenticité Stripe | `stripe.webhooks.constructEvent` avec signature |

### Implementation Considerations

- **SSG/ISR pour les sites publics** : Les landing pages des loueurs (`/s/{slug}`) utilisent ISR avec revalidation on-demand quand le loueur modifie son site — 95% du trafic servi depuis le CDN Vercel, coût quasi nul
- **Server Components** : L'app dashboard (`/app/*`) utilise des React Server Components pour minimiser le JS côté client
- **Edge middleware** : Vérification de l'auth et redirection via le middleware Supabase/Next.js
- **Validation** : Zod pour la validation des inputs côté serveur (API routes + Server Actions)
- **Rate limiting** : Sur les API publiques (tunnel de réservation, webhooks)
- **Hébergement** : Vercel Pro, optimisé avec ISR agressif sur les pages publiques pour maîtriser les coûts en haute saison

## Functional Requirements

### Gestion des Comptes & Accès

- FR1: Un loueur peut créer un compte avec email et mot de passe
- FR2: Un loueur peut compléter un onboarding guidé (profil, magasin, première catégorie)
- FR3: Un loueur (owner) peut inviter un employé par email
- FR4: Un employé peut accéder aux sections autorisées selon son rôle (dashboard, réservations, inventaire)
- FR5: Un loueur (owner) peut gérer les comptes employés (créer, désactiver)
- FR6: Le système restreint l'accès aux fonctions sensibles (prix, site web, paramètres, abonnement) aux owners uniquement

### Catalogue & Inventaire

- FR7: Un loueur peut créer, modifier et supprimer des catégories de produits
- FR8: Un loueur peut définir des attributs personnalisés par catégorie (type produit ou participant, format texte/nombre/select)
- FR9: Un loueur peut créer, modifier et supprimer des produits avec prix web et prix magasin
- FR10: Un loueur peut gérer les unités physiques (stock unitaire) de chaque produit
- FR11: Un loueur peut gérer une liste de marques et les associer à ses produits
- FR12: Le système met à jour la disponibilité du stock en < 5s après chaque changement de réservation

### Packs

- FR13: Un loueur peut créer, modifier et supprimer des packs composés de plusieurs produits
- FR14: Un loueur peut définir des produits obligatoires et optionnels dans un pack
- FR15: Un loueur peut définir des prix spécifiques (web/magasin) pour les items d'un pack, différents du prix unitaire

### Réservations

- FR16: Un client peut sélectionner des dates de location, puis consulter les produits et packs disponibles sur cette période
- FR17: Le système calcule et affiche la disponibilité des produits en temps réel en fonction des dates sélectionnées et du stock unitaire
- FR18: Un client peut sélectionner un pack dans le tunnel de réservation et activer ou désactiver les produits optionnels du pack
- FR19: Un employé ou owner peut créer une réservation manuelle depuis le back-office
- FR20: Un employé ou owner peut consulter les réservations selon 4 vues (à venir, en cours, passées, annulées)
- FR21: Un employé ou owner peut modifier le statut d'une réservation (confirmer, démarrer, terminer, annuler)
- FR22: Le système collecte les attributs participants dynamiques (définis par catégorie) lors de la réservation
- FR23: Le système empêche les double-bookings sur les unités physiques
- FR24: Un client reçoit une confirmation de réservation par email avec facture PDF

### Site Web du Loueur

- FR25: Un loueur peut configurer et publier un site web (landing page avec hero, sections personnalisables, informations magasin)
- FR26: Le site web du loueur affiche le catalogue avec catégories, produits, packs et prix
- FR27: Le site web intègre un tunnel de réservation complet (dates → disponibilité → sélection → participants → paiement)
- FR28: Chaque site de loueur est accessible via une URL publique unique basée sur un identifiant texte (slug)
- FR29: Le site web s'adapte aux écrans de 320px à 1440px (responsive)
- FR30: Le loueur peut configurer ses CGV/CGU affichées sur son site

### Paiements & Facturation

- FR31: Un client peut payer une réservation en ligne par carte bancaire via le processeur de paiement intégré
- FR32: Un employé ou owner peut enregistrer un paiement en espèces pour une réservation sur place
- FR33: Les paiements clients sont versés sur le compte marchand dédié du loueur
- FR34: Le système génère automatiquement une facture PDF conforme (mentions légales, SIRET, TVA)
- FR35: Le système envoie les emails transactionnels (confirmation, facture, invitation employé)

### Abonnement SaaS

- FR36: Un loueur peut souscrire à un plan d'abonnement (Saison 450€ ou Annuel 790€)
- FR37: Un loueur bénéficie d'un mois d'essai gratuit à l'inscription
- FR38: Le système gère le cycle de vie de l'abonnement (essai → actif → impayé → annulé)
- FR39: Un loueur peut consulter et gérer son abonnement (plan actuel, facturation, annulation)
- FR40: Le système affiche un bandeau d'alerte et bloque la création de nouvelles réservations en ligne si l'abonnement est inactif

### Dashboard & Pilotage

- FR41: Un loueur peut consulter un tableau de bord avec les métriques clés (réservations du jour, CA, taux d'occupation)
- FR42: Un employé peut consulter le tableau de bord des réservations du jour
- FR43: Le système affiche les réservations des 7 prochains jours avec les détails participants pour la préparation du matériel

### Gestion de la Plateforme (Admin Rentic)

- FR44: L'admin Rentic peut suivre les abonnements actifs, le MRR, les essais en cours et les churns via le tableau de bord de gestion des paiements
- FR45: Le système synchronise l'état des abonnements avec le provider de facturation en < 60s via webhooks
- FR46: L'admin peut identifier les abandons d'onboarding (profils non complétés)
- FR47: Le système journalise les erreurs applicatives avec stack trace, identifiant utilisateur et shop_id pour le diagnostic opérationnel

## Non-Functional Requirements

### Performance

- NFR1: Les pages publiques du loueur (landing + catalogue) se chargent en < 2s (LCP) grâce au cache statique et CDN
- NFR2: Le tunnel de réservation répond en < 500ms à chaque étape (calcul dispo, ajout panier, paiement)
- NFR3: Les actions dashboard (lister réservations, mettre à jour statut) s'exécutent en < 1s (p95)
- NFR4: Le système supporte 50 réservations simultanées par loueur en période de pointe avec un temps de réponse < 2x le p95 nominal (soit < 1s)

### Sécurité

- NFR5: Isolation complète des données entre loueurs via Row Level Security — aucune fuite de données cross-tenant
- NFR6: Aucune donnée de carte bancaire ne transite ou n'est stockée côté serveur (conformité PCI-DSS déléguée au processeur de paiement)
- NFR7: Tous les webhooks entrants sont vérifiés par signature cryptographique avant traitement
- NFR8: Les données personnelles (clients, participants) sont protégées conformément au RGPD (consentement, droit à l'effacement, chiffrement en transit)
- NFR9: Les sessions authentifiées expirent après 30 minutes d'inactivité et les tokens sont gérés côté serveur

### Scalabilité

- NFR10: L'architecture supporte jusqu'à 200 loueurs actifs sans changement d'infrastructure
- NFR11: Les pages publiques absorbent les pics saisonniers (vacances scolaires) via le cache CDN sans surcoût significatif (objectif : 95% de requêtes servies depuis le cache)
- NFR12: La base de données supporte la croissance du stock et des réservations avec des index appropriés (p95 < 200ms jusqu'à 100K réservations)

### Fiabilité

- NFR13: Uptime de 99.9% (< 9h de downtime par an)
- NFR14: 100% des paiements en ligne sont réconciliés — aucune perte de transaction
- NFR15: Les webhooks de paiement gèrent les retries et l'idempotence (pas de double traitement)
- NFR16: Backups automatiques quotidiens de la base de données avec RPO < 24h et RTO < 1h

### Intégration

- NFR17: Les intégrations de paiement tolèrent les indisponibilités temporaires du provider (retry 3x avec backoff exponentiel, tolérance max 1h)
- NFR18: Les emails transactionnels sont envoyés en < 30s après l'événement déclencheur
- NFR19: Le monitoring applicatif capture 100% des erreurs non gérées avec contexte suffisant pour le diagnostic (stack trace, user, shop_id)

### Accessibilité & SEO

- NFR20: Les sites publics des loueurs atteignent un score Lighthouse > 90 en desktop et > 85 en mobile (performance, SEO, accessibilité)
- NFR21: Le tunnel de réservation est utilisable sur mobile dès 320px de large avec des cibles tactiles ≥ 44x44px
- NFR22: Les pages publiques sont indexables par les moteurs de recherche (rendu serveur, meta tags, sitemap) avec indexation effective < 7 jours après publication
