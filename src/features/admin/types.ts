// Types du domaine « administration plateforme » (Epic 9).
// Le client Supabase n'est pas typé par le schéma généré : on décrit ici la
// forme des lignes lues, ce qui évite tout `as` côté requêtes.

export type SubscriptionPlan = "trial" | "season" | "annual";

export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "expired";

export type PlatformOverview = {
  shopsTotal: number;
  shopsActive: number;
  shopsTrialing: number;
  shopsPastDue: number;
  shopsChurned: number;
  /** MRR estimé, en centimes */
  estimatedMrrCents: number;
  reservationsTotal: number;
  /** Chiffre d'affaires encaissé (paiements `succeeded`), en centimes */
  collectedRevenueCents: number;
  latestShops: LatestShop[];
};

export type LatestShop = {
  id: string;
  name: string;
  createdAt: string;
  status: SubscriptionStatus | null;
};

export type ShopListRow = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  status: SubscriptionStatus | null;
  plan: SubscriptionPlan | null;
  productsCount: number;
  reservationsCount: number;
  websitePublished: boolean;
};

export type ShopListPage = {
  rows: ShopListRow[];
  page: number;
  pageCount: number;
  total: number;
};

export type OnboardingFunnelRow = {
  shopId: string;
  shopName: string;
  slug: string;
  createdAt: string;
  onboardingCompleted: boolean;
  currentStep: number | null;
  categoriesCount: number;
  productsCount: number;
  reservationsCount: number;
  websitePublished: boolean;
  daysSinceSignup: number;
};

export type OnboardingFunnel = {
  incomplete: OnboardingFunnelRow[];
  inactive: OnboardingFunnelRow[];
};
