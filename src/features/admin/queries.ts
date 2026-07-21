import { createAdminClient } from "@/lib/supabase/admin";
import type {
  LatestShop,
  OnboardingFunnel,
  OnboardingFunnelRow,
  PlatformOverview,
  ShopListPage,
  ShopListRow,
  SubscriptionPlan,
  SubscriptionStatus,
} from "./types";

// Tarifs publics, en centimes (source : grille tarifaire Rentic).
// Les prix réels vivent dans Stripe (STRIPE_PRICE_SEASON / STRIPE_PRICE_ANNUAL) :
// ces constantes ne servent QU'au calcul d'un MRR indicatif côté admin.
const PLAN_PRICE_CENTS: Record<"season" | "annual", number> = {
  season: 45_000, // 450 €
  annual: 79_000, // 790 €
};

// Durée d'amortissement retenue pour normaliser chaque formule en mensuel.
// Hypothèse : la formule « Saison » couvre une saison de location de 6 mois,
// la formule « Annuel » 12 mois. MRR = Σ (prix formule / durée en mois).
const PLAN_MONTHS: Record<"season" | "annual", number> = {
  season: 6,
  annual: 12,
};

const CHURNED_STATUSES: SubscriptionStatus[] = ["canceled", "expired"];

/** Nombre maximum de loueurs affichés par page (borne NCF). */
export const SHOPS_PAGE_SIZE = 50;

type SubscriptionRow = {
  shop_id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
};

type ShopRow = { id: string; name: string; created_at: string };

type PaymentRow = { amount: number | null };

// `plan` et `status` sont des colonnes `text` avec CHECK côté base : le
// schéma généré les expose donc en `string`. On les rétrécit ici, à la
// frontière, plutôt que de faire confiance à un cast.
function toSubscriptionRow(row: {
  shop_id: string;
  plan: string;
  status: string;
}): SubscriptionRow | null {
  const plan = PLANS.find((p) => p === row.plan);
  const status = STATUSES.find((s) => s === row.status);
  if (!plan || !status) return null;
  return { shop_id: row.shop_id, plan, status };
}

const PLANS: SubscriptionPlan[] = ["trial", "season", "annual"];
const STATUSES: SubscriptionStatus[] = [
  "trialing",
  "active",
  "past_due",
  "canceled",
  "expired",
];

// Les colonnes d'une vue Postgres sont toutes nullables du point de vue du
// schéma généré (le planificateur ne peut pas garantir la non-nullité à
// travers les LEFT JOIN). On normalise ici avec des valeurs de repli.
type RawFunnelRow = {
  shop_id: string | null;
  shop_name: string | null;
  slug: string | null;
  created_at: string | null;
  onboarding_completed?: boolean | null;
  onboarding_current_step?: number | null;
  categories_count?: number | null;
  products_count: number | null;
  reservations_count: number | null;
  website_published: boolean | null;
};

type FunnelRow = {
  shop_id: string;
  shop_name: string;
  slug: string;
  created_at: string;
  onboarding_completed: boolean;
  onboarding_current_step: number | null;
  categories_count: number;
  products_count: number;
  reservations_count: number;
  website_published: boolean;
};

/** Normalise une ligne de vue ; écarte celles sans identifiant exploitable. */
function toFunnelRow(row: RawFunnelRow): FunnelRow | null {
  if (!row.shop_id || !row.created_at) return null;
  return {
    shop_id: row.shop_id,
    shop_name: row.shop_name ?? "Magasin sans nom",
    slug: row.slug ?? "",
    created_at: row.created_at,
    onboarding_completed: row.onboarding_completed ?? false,
    onboarding_current_step: row.onboarding_current_step ?? null,
    categories_count: row.categories_count ?? 0,
    products_count: row.products_count ?? 0,
    reservations_count: row.reservations_count ?? 0,
    website_published: row.website_published ?? false,
  };
}

function countBy(
  subscriptions: SubscriptionRow[],
  statuses: SubscriptionStatus[],
): number {
  return subscriptions.filter((s) => statuses.includes(s.status)).length;
}

/**
 * MRR estimé, en centimes.
 * Seuls les abonnements `active` sont comptés (un essai ne génère aucun
 * revenu, un impayé n'est pas encaissé). Chaque formule est normalisée en
 * mensuel : annuel 790 €/12, saison 450 €/6.
 */
function computeEstimatedMrrCents(subscriptions: SubscriptionRow[]): number {
  return subscriptions
    .filter((s) => s.status === "active")
    .reduce((total, s) => {
      if (s.plan !== "season" && s.plan !== "annual") return total;
      return total + PLAN_PRICE_CENTS[s.plan] / PLAN_MONTHS[s.plan];
    }, 0);
}

export async function getPlatformOverview(): Promise<PlatformOverview> {
  const supabase = createAdminClient();

  const [shopsCount, subscriptionsResult, reservationsCount, paymentsResult, latestShopsResult] =
    await Promise.all([
      supabase.from("shops").select("id", { count: "exact", head: true }),
      // Volume attendu : une ligne par magasin (contrainte UNIQUE(shop_id)),
      // donc lecture complète assumée à l'échelle de la plateforme.
      supabase.from("subscriptions").select("shop_id, plan, status"),
      supabase.from("reservations").select("id", { count: "exact", head: true }),
      // Postgrest n'expose pas d'agrégat sum() : on additionne côté serveur.
      supabase.from("payments").select("amount").eq("status", "succeeded"),
      supabase
        .from("shops")
        .select("id, name, created_at")
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

  const subscriptions: SubscriptionRow[] = (subscriptionsResult.data ?? [])
    .map(toSubscriptionRow)
    .filter((s): s is SubscriptionRow => s !== null);
  const payments: PaymentRow[] = paymentsResult.data ?? [];
  const latest: ShopRow[] = latestShopsResult.data ?? [];

  const statusByShop = new Map<string, SubscriptionStatus>(
    subscriptions.map((s) => [s.shop_id, s.status]),
  );

  const latestShops: LatestShop[] = latest.map((shop) => ({
    id: shop.id,
    name: shop.name,
    createdAt: shop.created_at,
    status: statusByShop.get(shop.id) ?? null,
  }));

  return {
    shopsTotal: shopsCount.count ?? 0,
    shopsActive: countBy(subscriptions, ["active"]),
    shopsTrialing: countBy(subscriptions, ["trialing"]),
    shopsPastDue: countBy(subscriptions, ["past_due"]),
    shopsChurned: countBy(subscriptions, CHURNED_STATUSES),
    estimatedMrrCents: Math.round(computeEstimatedMrrCents(subscriptions)),
    reservationsTotal: reservationsCount.count ?? 0,
    collectedRevenueCents: payments.reduce((sum, p) => sum + (p.amount ?? 0), 0),
    latestShops,
  };
}

/**
 * Liste paginée des loueurs, du plus récent au plus ancien.
 * La vue `admin_onboarding_funnel` fournit déjà les compteurs par magasin.
 */
export async function getShopsPage(requestedPage: number): Promise<ShopListPage> {
  const supabase = createAdminClient();

  const page = Number.isFinite(requestedPage) ? Math.max(1, Math.trunc(requestedPage)) : 1;
  const from = (page - 1) * SHOPS_PAGE_SIZE;

  const { data, count } = await supabase
    .from("admin_onboarding_funnel")
    .select(
      "shop_id, shop_name, slug, created_at, products_count, reservations_count, website_published",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(from, from + SHOPS_PAGE_SIZE - 1);

  const rows: FunnelRow[] = (data ?? [])
    .map(toFunnelRow)
    .filter((r): r is FunnelRow => r !== null);

  const { data: subscriptionsData } = await supabase
    .from("subscriptions")
    .select("shop_id, plan, status")
    .in(
      "shop_id",
      rows.map((r) => r.shop_id),
    );

  const subscriptions: SubscriptionRow[] = (subscriptionsData ?? [])
    .map(toSubscriptionRow)
    .filter((s): s is SubscriptionRow => s !== null);
  const byShop = new Map<string, SubscriptionRow>(
    subscriptions.map((s) => [s.shop_id, s]),
  );

  const total = count ?? rows.length;

  return {
    rows: rows.map((row): ShopListRow => {
      const subscription = byShop.get(row.shop_id);
      return {
        id: row.shop_id,
        name: row.shop_name,
        slug: row.slug,
        createdAt: row.created_at,
        status: subscription?.status ?? null,
        plan: subscription?.plan ?? null,
        productsCount: row.products_count,
        reservationsCount: row.reservations_count,
        websitePublished: row.website_published,
      };
    }),
    page,
    pageCount: Math.max(1, Math.ceil(total / SHOPS_PAGE_SIZE)),
    total,
  };
}

/** Nombre de jours entiers écoulés depuis une date ISO. */
export function daysSince(isoDate: string, now: Date = new Date()): number {
  const created = new Date(isoDate).getTime();
  if (Number.isNaN(created)) return 0;
  return Math.max(0, Math.floor((now.getTime() - created) / 86_400_000));
}

/**
 * Story 9.3 — abandons d'onboarding.
 * Deux populations distinctes :
 *  - `incomplete` : onboarding jamais terminé ;
 *  - `inactive`   : onboarding terminé mais ni produit ni réservation.
 */
export async function getOnboardingFunnel(): Promise<OnboardingFunnel> {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("admin_onboarding_funnel")
    .select(
      "shop_id, shop_name, slug, created_at, onboarding_completed, onboarding_current_step, categories_count, products_count, reservations_count, website_published",
    )
    .order("created_at", { ascending: false });

  const rows: FunnelRow[] = (data ?? [])
    .map(toFunnelRow)
    .filter((r): r is FunnelRow => r !== null);
  const now = new Date();

  const mapped: OnboardingFunnelRow[] = rows.map((row) => ({
    shopId: row.shop_id,
    shopName: row.shop_name,
    slug: row.slug,
    createdAt: row.created_at,
    onboardingCompleted: row.onboarding_completed,
    currentStep: row.onboarding_current_step,
    categoriesCount: row.categories_count,
    productsCount: row.products_count,
    reservationsCount: row.reservations_count,
    websitePublished: row.website_published,
    daysSinceSignup: daysSince(row.created_at, now),
  }));

  return {
    incomplete: mapped.filter((row) => !row.onboardingCompleted),
    inactive: mapped.filter(
      (row) =>
        row.onboardingCompleted &&
        row.productsCount === 0 &&
        row.reservationsCount === 0,
    ),
  };
}
