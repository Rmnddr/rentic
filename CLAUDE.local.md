# Rentic — Surcharges locales

> Complète le CLAUDE.md NCF. Conventions spécifiques à ce projet.

## Projet

- **Nom** : Rentic
- **Description** : SaaS B2B2C de location saisonnière d'équipements sportifs — réécriture Next.js de l'app Bubble `rentic-65966`. Site vitrine par loueur + tunnel de réservation + gestion stock/packs + paiements.
- **URL prod** : (pas encore déployé)
- **Stack addons** : Supabase (Postgres + Auth + RLS), Stripe (double flux : abonnement SaaS + Connect Express), Resend (à intégrer), Sentry

## Intégrations spécifiques

### Supabase
- **Types générés** : `src/types/database.ts` est produit par le CLI, ne jamais l'éditer à la main. Les 4 clients (`server`, `client`, `admin`, `proxy`) sont paramétrés par `Database`, donc tables, colonnes et signatures RPC sont vérifiées par `tsc`.
  **Après CHAQUE migration** : `supabase gen types typescript --linked > src/types/database.ts` (puis relire l'en-tête du fichier, qui rappelle la commande).
  À savoir : les colonnes d'une **vue** arrivent toutes nullables (Postgres ne garantit pas la non-nullité à travers les LEFT JOIN) et les colonnes `text` à CHECK arrivent en `string` — il faut donc normaliser/rétrécir à la frontière, cf. `src/features/admin/queries.ts`.
- Multi-tenant par RLS : `shop_id` est le pivot, isolation par policies (test : `supabase/tests/rls-isolation.sql`)
- Helper Postgres `get_user_shop_id()` utilisé par les actions serveur
- Anti double-booking : fonction `check_availability(product_id, start, end)`
- Projet distant actuel : `mdawpbktapdkeelhaedy` (org perso, région Paris), linké et fonctionnel — recréé le 21/07/2026 après suppression de l'historique `qslfpiheuqdhiufgyfdd`. Toutes les migrations y sont appliquées.
- Storage : bucket public `shop-media` (5 Mo max, MIME images imposés au niveau bucket), arborescence `{shop_id}/{domaine}/{uuid}.{ext}`, écriture limitée au préfixe du shop par policies RLS. Upload direct navigateur via `src/components/shared/image-upload.tsx`.

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

### Resend (emails) — EN ATTENTE DU DOMAINE
L'envoi réel est bloqué tant qu'il n'y a pas de domaine : Resend exige un
domaine vérifié par DNS pour expédier autrement qu'en test.

En attendant, `sendEmail()` (`src/lib/email/send.ts`) ne casse rien : il logue
un avertissement et écrit une ligne `email_logs` en statut `skipped`. Aucun
code appelant n'est à modifier.

Quand le domaine sera là :
1. Ajouter le domaine dans Resend, poser les DNS (SPF/DKIM), attendre la vérification
2. Renseigner `RESEND_API_KEY` dans `.env.local` (et chez l'hébergeur)
3. Ajuster l'expéditeur si besoin — actuellement `Rentic <noreply@rentic.fr>` en dur dans `src/lib/email/send.ts`
4. Vérifier : une réservation web doit produire une ligne `email_logs` en `sent` (et non `skipped`)

Emails déjà branchés : confirmation de réservation (tunnel) et invitation employé.

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
