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

## Phase 1 — Socle NCF ✅ FAIT le 21/07/2026

Mise en conformité des fondations avant toute nouvelle feature :

- [x] `src/lib/env.ts` : validation Zod de toutes les variables d'env au démarrage (+ `requireEnv()` pour les optionnelles Stripe/Resend, client Stripe lazy via `getStripe()`)
- [x] Helper `requireAuth()` (+ variante `requireShop()`) dans `src/lib/supabase/auth.ts`
- [x] Passe sur les **10 fichiers d'actions / 34 actions** : `requireAuth()` ligne 1 + schéma Zod par action (ordre NCF : AUTH → VALIDATION → VÉRIFICATION → OPÉRATION). Schémas partagés dans `src/lib/schemas/` alignés sur les CHECK constraints des migrations. Exceptions documentées : actions auth et tunnel publiques par design.

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

- [x] `loading.tsx` + `error.tsx` sur chaque route avec fetch async (10 loading + 3 error, skeletons calés sur les vraies pages)
- [x] Purge des casts `as` non commentés (11 éliminés, 3 + webhooks annotés `// EXCEPTION-TYPECAST:`)
- [x] Premiers tests vitest : **85 tests** (contrats de schémas + comportement des actions catalog/tunnel). Note : `jsdom` manquait des devDeps — vitest n'avait jamais pu tourner.

Corrections de bugs au passage : erreur d'update du téléphone magasin ignorée, JSON non-tableau pouvant corrompre `shop_websites.sections`, portail Stripe sans check d'auth, erreurs d'insert paiements avalées.
À retenir pour la Phase 2 : `createPaymentIntentAction` exige désormais l'auth — le tunnel public aura besoin d'une variante anonyme sécurisée.

## Phase 2 — Tunnel de réservation public ✅ FAIT le 21/07/2026 (hors paiement CB)

- [x] `/s/[shopSlug]/reserver` : 4 étapes — dates (calendrier range FR) → matériel dispo via `check_availability` → participants EAV → récap/CGV/confirmation
- [x] Panier Zustand : produits + packs (items obligatoires/optionnels, prix overridés)
- [x] Formulaire participants : attributs EAV dynamiques par catégorie (text/number/select)
- [x] RLS : découverte majeure — AUCUNE table n'était lisible publiquement (le site vitrine n'a jamais marché pour un anonyme). Migration `20260721000001` : policies de lecture publique conditionnées à `is_published`, et écriture via fonction `create_web_reservation` SECURITY DEFINER.
- [x] Transaction atomique : fonction Postgres unique — prix recalculés SERVEUR (le client n'envoie jamais de prix ; l'ancienne action faisait confiance au unitPrice client !), unités verrouillées FOR UPDATE, rollback complet vérifié en cas de stock insuffisant.
- [x] Vérifié en réel dans le navigateur : 2 réservations créées (pack avec option + produit seul), stock décrémenté sur dates chevauchantes, surbooking refusé, prix client ignoré.
- [ ] Paiement CB client final → reporté Phase 3 (nécessite les clés Stripe ; le tunnel affiche "paiement sur place au retrait")
- [ ] Test e2e Playwright automatisé du parcours (vérifié manuellement pour l'instant)

Boutique de démo en base : `glisse-test` (Glisse Pyrénées, 3 produits, 1 pack, attributs Pointure/Niveau).

## Phase 3 — Paiements, factures, emails ✅ FAIT le 21/07/2026

- [x] Carte Stripe Connect dans Settings (3 états : absent / incomplet / actif, retour d'onboarding géré)
- [x] `recordCashPaymentAction` branchée : dialog "Encaisser en espèces" + badge Payée/En attente dans la liste
- [x] `src/lib/email/` : Resend avec **no-op sûr** — sans `RESEND_API_KEY`, log + ligne `email_logs` en `skipped`, jamais d'exception. Confirmation de résa (fire-and-forget depuis le tunnel) + invitation employé (TODO levé).
- [x] Facture PDF conforme France : `FAC-{YYYY}-{NNNN}` séquentiel par shop/année, rendue à la volée par `@react-pdf/renderer` (jamais stockée), mention art. 293 B du CGI si pas de n° TVA
- [x] Paiement CB dans le tunnel (Payment Element, destination charge vers le compte Connect du loueur)
- [x] Réconciliation webhook testée de bout en bout en mode test Stripe

**Bugs sérieux corrigés au passage :**
- Les deux webhooks Stripe tournaient sur le client anonyme → **toutes les mises à jour étaient bloquées par RLS** : la réconciliation des paiements et des abonnements n'a jamais fonctionné.
- `webhook_events` n'avait **aucune RLS** : tout porteur de la clé anon pouvait y insérer et casser l'idempotence des webhooks.
- Le PaymentIntent était recréé à chaque montage du composant (doublons de paiement observés en test) → réutilisation de l'intent `pending` + `idempotencyKey` Stripe + index unique en base.

Compte de démo pour tester : `demo-owner@glisse-test.fr` (mot de passe généré, voir scratchpad de session) sur la boutique `glisse-test`, avec un compte Stripe Connect de test actif.

## Phase 4 — Admin plateforme & finitions ✅ FAIT le 21/07/2026

- [x] Rôle admin plateforme (table `platform_admins` + `is_platform_admin()`, pas de modification de l'enum `user_role`) et routes `/admin` : vue d'ensemble (MRR estimé, statuts d'abonnement, CA encaissé), liste des loueurs, abandons d'onboarding (vue `admin_onboarding_funnel`)
- [x] Cycle de vie abonnement vérifié en navigateur : essai → bandeau d'alerte à J-7 → expiré → blocage effectif vers `/subscription`
- [x] Bandeau d'alerte + blocage (story 7.5) : **n'existaient tout simplement pas**, `subscription_active` n'était lu nulle part
- [x] e2e Playwright : 6 tests verts (tunnel complet, indisponibilité de stock, authentification, protection `/admin`) avec seed isolé et nettoyage
- [x] `sprint-status.yaml` mis à jour

**🔴 Bug critique découvert : le middleware ne s'exécutait PAS.**
`middleware.ts` était à la racine du projet alors que le code vit dans `src/` — Next.js ne le chargeait jamais (manifeste middleware vide). **Toute la protection de routes était du code mort depuis la création du projet** : contrôle d'authentification, restriction des routes propriétaire… Seul le garde `redirect("/login")` du layout dashboard faisait illusion. Corrigé par le passage à `src/proxy.ts` (convention Next 16, `middleware.ts` étant déprécié), vérifié par une redirection de contrôle puis par les tests e2e.

Autre correctif : `CardTitle` rendait un `<div>`, donc les pages publiques (connexion, inscription, onboarding) n'exposaient **aucun `h1`** — ajout d'un `asChild` et de vrais headings (a11y + SEO).

---

**Total estimé : 8 à 12 jours** pour un produit démontrable à un premier loueur pilote (boucle complète : site en ligne → résa web → paiement → dashboard).

Ordre de reprise recommandé : 0 → 1 → 2 (le tunnel est prioritaire ; les phases 3 et 4 peuvent suivre le premier retour terrain).
