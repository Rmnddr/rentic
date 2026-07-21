# Rentic — Surcharges locales

> Complète le CLAUDE.md NCF. Conventions spécifiques à ce projet.

## Projet

- **Nom** : Rentic
- **Description** : SaaS B2B2C de location saisonnière d'équipements sportifs — réécriture Next.js de l'app Bubble `rentic-65966`. Site vitrine par loueur + tunnel de réservation + gestion stock/packs + paiements.
- **URL prod** : (pas encore déployé)
- **Stack addons** : Supabase (Postgres + Auth + RLS), Stripe (double flux : abonnement SaaS + Connect Express), Resend (à intégrer), Sentry

## Intégrations spécifiques

### Supabase
- Multi-tenant par RLS : `shop_id` est le pivot, isolation par policies (test : `supabase/tests/rls-isolation.sql`)
- Helper Postgres `get_user_shop_id()` utilisé par les actions serveur
- Anti double-booking : fonction `check_availability(product_id, start, end)`
- ⚠️ Le projet distant historique (`qslfpiheuqdhiufgyfdd`) a été supprimé — recréer un projet et rejouer les 10 migrations (`supabase/migrations/`), puis mettre à jour `.env.local` et `.mcp.json`

### Stripe
- Version SDK : `stripe@^20`, client lazy via `getStripe()` (jamais d'instanciation au chargement du module)
- Deux flux distincts : abonnements plateforme (Saison 450€ / Annuel 790€, 1 mois d'essai) et Stripe Connect Express (le loueur encaisse ses clients)
- Webhooks séparés : `/api/webhooks/stripe-subscriptions` et `/api/webhooks/stripe-connect` — ils utilisent le **client admin** (service role) : un webhook n'a pas de session, le client anonyme se faisait bloquer par RLS
- Paiement tunnel : `createTunnelPaymentAction` (action publique) relit le montant en base, réutilise le PaymentIntent `pending` existant et passe un `idempotencyKey` — plus index unique sur `payments.stripe_payment_intent_id`

**Tester les webhooks en local** : `stripe listen` doit tourner avec la clé du projet (le CLI peut être authentifié sur un autre compte) :
```
SK=$(grep ^STRIPE_SECRET_KEY .env.local | cut -d= -f2)
stripe listen --api-key "$SK" --forward-to localhost:3000/api/webhooks/stripe-connect
```
Remplacer temporairement `STRIPE_WEBHOOK_SECRET_CONNECT` par le secret rendu par `stripe listen --print-secret` (la valeur en place vient du dashboard, pour le déploiement).

## Conventions métier

- Catalogue EAV : attributs produit ET participant personnalisables par catégorie (pointure pour le ski, poids pour le paddle)
- Packs = produits multi-items avec items obligatoires/optionnels et prix overridables par item
- Réservations : sources `web` (tunnel public) ou `manual` (back-office)
- Vitrine publique par tenant : `/s/[shopSlug]`

## Variables d'environnement requises

```
NEXT_PUBLIC_SUPABASE_URL=            # URL du projet Supabase
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY= # clé publique
SUPABASE_SERVICE_ROLE_KEY=           # clé service role (admin client)
SENTRY_DSN=                          # + NEXT_PUBLIC_SENTRY_DSN
STRIPE_SECRET_KEY=                   # Epic 6 — jamais configuré à ce jour
STRIPE_WEBHOOK_SECRET_SUBSCRIPTIONS=
STRIPE_WEBHOOK_SECRET_CONNECT=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
RESEND_API_KEY=                      # Epic 6.5 — jamais configuré
NEXT_PUBLIC_APP_URL=http://localhost:3000
REVALIDATION_SECRET=
```

## Ce qu'on ne touche pas sans discussion

- Le schéma RLS des 10 migrations existantes (rejouer, ne pas réécrire — toute évolution = nouvelle migration)
- `check_availability` : garantie zéro double-booking (critère de succès n°1 du PRD)

## Contacts & ressources

- Docs métier : `docs/bubble-app-analysis.md` (analyse de l'app Bubble source), `_bmad-output/planning-artifacts/` (PRD, architecture, épics)
- Plan de reprise : `docs/plan-reprise-2026-07.md`
