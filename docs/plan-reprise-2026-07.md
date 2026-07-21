# Plan de reprise Rentic — 21 juillet 2026

> État des lieux réalisé le 21/07/2026, ~4 mois après le dernier commit (24/03/2026).
> Objectif : reprendre le projet en intégrant la conformité NCF au fil de l'eau.

## Résumé de l'état réel

Le `sprint-status.yaml` marquait les 9 épics "done" — faux. État réel :

| Epic | Statut réel | Détail |
|------|-------------|--------|
| 1. Foundation, Auth & Accès | ✅ done | Auth, middleware rôles, RLS |
| 2. Onboarding & Catalogue | ✅ done | Wizard, CRUD complet, EAV |
| 3. Packs & Tarification | ✅ done | CRUD packs, obligatoire/optionnel, prix |
| 4. Réservations back-office | 🟡 ~80% | CRUD + statuts OK ; 4 vues et toggle matériel à vérifier |
| 5. Site web & Tunnel | 🔴 ~40% | Landing + CGV + catalogue public OK ; **tunnel de résa sans UI** (actions serveur seules) |
| 6. Paiements & Facturation | 🔴 ~30% | Actions Stripe écrites mais **branchées à aucune UI** ; ni facture PDF ni emails (`lib/email/` vide) |
| 7. Abonnement SaaS | 🟡 ~70% | Checkout + portal + webhooks OK ; cycle de vie/bandeau blocage à tester |
| 8. Dashboard & Équipe | 🟡 ~70% | Dashboard + invitations OK (mais pas d'email envoyé, TODO Resend) |
| 9. Admin plateforme | 🔴 0% | Aucune route `/admin`, aucun rôle admin dans le middleware |

**Actifs solides** : schéma BDD (10 migrations, RLS multi-tenant, EAV, anti double-booking), `tsc --noEmit` propre, structure par features conforme NCF, planning BMAD complet.

**Dettes NCF** : pas de `CLAUDE.local.md`, pas de `lib/env.ts`, aucun `requireAuth()` (7/10 fichiers d'actions sans `auth.getUser()`), zéro validation Zod serveur (casts `formData.get() as string`), zéro test vitest, e2e vide, un seul `error.tsx`, aucun `loading.tsx`.

---

## Phase 0 — Remise en route (½ jour)

- [ ] Pinner les deps flottantes (`next: latest`, `@supabase/ssr: latest`, `@supabase/supabase-js: latest`) sur les versions du lockfile, puis `npm install` + `npm run build` pour valider que rien n'a bougé
- [ ] Commiter `docs/`, `_bmad-output/`, `.claude/` (mémoire du projet, actuellement non versionnée)
- [ ] Vérifier que le projet Supabase distant existe encore et que les 10 migrations y sont appliquées (`supabase db diff`)
- [ ] Créer `CLAUDE.local.md` depuis `~/Dev/_templates/nextjs/CLAUDE.local.md` (stack addons : Supabase, Stripe, Resend, Sentry)
- [ ] Supprimer `conv` (pointeur de session obsolète) et `tsconfig.tsbuildinfo` du repo

## Phase 1 — Socle NCF (1 à 1,5 jour)

Mise en conformité des fondations avant toute nouvelle feature :

- [ ] `src/lib/env.ts` : validation Zod de toutes les variables d'env au démarrage
- [ ] Helper `requireAuth()` (+ variante `requireShop()`) dans `src/lib/supabase/`
- [ ] Passe sur les **10 fichiers d'actions / 34 actions** : `requireAuth()` ligne 1 + schéma Zod par action (ordre NCF : AUTH → VALIDATION → VÉRIFICATION → OPÉRATION)

| Fichier | Actions | Effort |
|---------|---------|--------|
| `catalog/actions.ts` (311 l.) | 13 | ~2 h |
| `reservations/actions.ts` (171 l.) | 2 | ~45 min |
| `payments/actions.ts` (138 l.) | 3 | ~45 min |
| `packs/actions.ts` (138 l.) | 3 | ~45 min |
| `onboarding/actions.ts` (117 l.) | 3 | ~30 min |
| `tunnel/actions.ts` (130 l.) | 1 | ~30 min |
| `subscriptions/actions.ts` (80 l.) | 2 | ~30 min |
| `website-builder/actions.ts` (79 l.) | 2 | ~30 min |
| `auth/actions.ts` (77 l.) | 3 | ~30 min |
| `employees/actions.ts` (62 l.) | 2 | ~30 min |

- [ ] `loading.tsx` + `error.tsx` sur chaque route avec fetch async (dashboard, catalog, packs, reservations, s/[shopSlug]…)
- [ ] Purge des casts `as` non commentés (`// EXCEPTION-TYPECAST:` sinon)
- [ ] Premiers tests vitest sur les actions critiques (catalog, reservations, tunnel) — pose le harnais TDD pour la suite

## Phase 2 — Tunnel de réservation public (3 à 5 jours) ⭐ priorité produit

C'est LA feature qui sépare "démo dashboard" de "produit vendable". Stories 5.5 → 5.7 + 6.2. En TDD strict (TEST RED d'abord).

- [ ] `/s/[shopSlug]/reserver` : sélection dates → produits/packs disponibles sur la période (via `check_availability`)
- [ ] Panier (state client, Zustand conforme stack NCF) : produits + packs avec items optionnels
- [ ] Formulaire participants : attributs EAV dynamiques par catégorie
- [ ] **Point de vigilance RLS** : `createWebReservationAction` utilise le client anonyme — vérifier/écrire les policies d'insert public (ou passer par le client admin service-role dans la server action). Jamais testé faute d'UI.
- [ ] Paiement CB client final : brancher `createPaymentIntentAction` (Stripe Connect, `on_behalf_of` du shop) + page de confirmation
- [ ] Transaction : la création résa + items + assignation d'unités doit être atomique (actuellement boucle d'inserts sans rollback — passer par une fonction Postgres `create_reservation` transactionnelle)
- [ ] Test e2e Playwright du parcours complet (dates → panier → participants → paiement test → confirmation)

## Phase 3 — Paiements, factures, emails (2 à 3 jours)

- [ ] Brancher l'onboarding Stripe Connect dans l'UI settings (action existante, jamais appelée)
- [ ] Brancher `recordCashPaymentAction` dans la vue réservation back-office
- [ ] `src/lib/email/` : intégration Resend — confirmation de résa, facture, invitation employé (lever le TODO de `employees/actions.ts`)
- [ ] Facture PDF conforme (feature `invoicing/` vide aujourd'hui) — react-pdf ou service externe
- [ ] Tester la réconciliation webhook Connect en mode test Stripe de bout en bout

## Phase 4 — Admin plateforme & finitions (2 jours)

- [ ] Rôle `platform_admin` dans le middleware + routes `/admin` (métriques abonnements, abandons d'onboarding)
- [ ] Vérifier cycle de vie abonnement complet (essai → payant → échec paiement → blocage + bandeau)
- [ ] e2e Playwright : signup → onboarding → catalogue → résa manuelle
- [ ] Mettre à jour `sprint-status.yaml` au fil de l'eau

---

**Total estimé : 8 à 12 jours** pour un produit démontrable à un premier loueur pilote (boucle complète : site en ligne → résa web → paiement → dashboard).

Ordre de reprise recommandé : 0 → 1 → 2 (le tunnel est prioritaire ; les phases 3 et 4 peuvent suivre le premier retour terrain).
