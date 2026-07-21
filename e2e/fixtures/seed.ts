import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { requireEnv } from "./env";

// Seed e2e isolé : chaque spec crée SA boutique (slug dédié) et la détruit
// après coup. On n'utilise jamais les données de démo partagées.
//
// Le client service role court-circuite RLS — réservé aux tests.

export type SeededProduct = {
  id: string;
  name: string;
  priceWeb: number;
  unitIds: string[];
};

export type SeededShop = {
  shopId: string;
  slug: string;
  name: string;
  categoryId: string;
  attributeId: string;
  attributeName: string;
  products: SeededProduct[];
};

export type SeedOptions = {
  slug: string;
  /** Nom de la boutique affiché sur la vitrine */
  name?: string;
  /** Nombre d'unités physiques par produit (stock limité volontairement) */
  unitsPerProduct?: number;
};

let cachedClient: SupabaseClient | null = null;

export function adminClient(): SupabaseClient {
  if (!cachedClient) {
    cachedClient = createClient(
      requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
      requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
      { auth: { autoRefreshToken: false, persistSession: false } },
    );
  }
  return cachedClient;
}

type IdRow = { id: string };

function unwrap<T>(result: { data: T | null; error: { message: string } | null }, context: string): T {
  if (result.error || result.data === null) {
    throw new Error(`Seed e2e — ${context} : ${result.error?.message ?? "aucune donnée"}`);
  }
  return result.data;
}

/**
 * Crée une boutique de test complète :
 * - site publié (condition de visibilité publique côté RLS)
 * - 1 catégorie produit + 1 attribut participant obligatoire (Pointure, number)
 * - 2 produits avec un stock physique limité
 * - AUCUN compte Stripe Connect → le tunnel s'arrête à la confirmation
 */
export async function seedTestShop(options: SeedOptions): Promise<SeededShop> {
  const { slug, name = `Boutique e2e ${slug}`, unitsPerProduct = 2 } = options;
  const supabase = adminClient();

  // Repartir d'un état propre : les tests doivent pouvoir tourner deux fois
  await cleanupTestShop(slug);

  const shop = unwrap(
    await supabase
      .from("shops")
      .insert({
        name,
        slug,
        email: `${slug}@example.test`,
        phone: "0400000000",
        address: "1 rue des Tests, 74000 Annecy",
        subscription_active: true,
        onboarding_completed: true,
      })
      .select("id")
      .single<IdRow>(),
    "création de la boutique",
  );

  unwrap(
    await supabase
      .from("shop_websites")
      .insert({
        shop_id: shop.id,
        hero_title: `Bienvenue chez ${name}`,
        hero_subtitle: "Location de matériel de test",
        is_published: true,
      })
      .select("id")
      .single<IdRow>(),
    "création du site vitrine",
  );

  const category = unwrap(
    await supabase
      .from("categories")
      .insert({ shop_id: shop.id, name: "Skis", type: "product", position: 0 })
      .select("id")
      .single<IdRow>(),
    "création de la catégorie",
  );

  const attribute = unwrap(
    await supabase
      .from("category_attributes")
      .insert({
        category_id: category.id,
        name: "Pointure",
        scope: "participant",
        format: "number",
        required: true,
        position: 0,
      })
      .select("id")
      .single<IdRow>(),
    "création de l'attribut participant",
  );

  const productSpecs = [
    { name: "Ski Rossignol e2e", price_web: 4500 },
    { name: "Ski Salomon e2e", price_web: 3000 },
  ];

  const products: SeededProduct[] = [];

  for (const spec of productSpecs) {
    const product = unwrap(
      await supabase
        .from("products")
        .insert({
          shop_id: shop.id,
          category_id: category.id,
          name: spec.name,
          description: "Produit de test e2e",
          price_web: spec.price_web,
          price_shop: spec.price_web,
        })
        .select("id")
        .single<IdRow>(),
      `création du produit ${spec.name}`,
    );

    const units = unwrap(
      await supabase
        .from("product_units")
        .insert(
          Array.from({ length: unitsPerProduct }, (_, index) => ({
            product_id: product.id,
            label: `${spec.name} #${index + 1}`,
            status: "available",
          })),
        )
        .select("id")
        .returns<IdRow[]>(),
      `création des unités de ${spec.name}`,
    );

    products.push({
      id: product.id,
      name: spec.name,
      priceWeb: spec.price_web,
      unitIds: units.map((unit) => unit.id),
    });
  }

  return {
    shopId: shop.id,
    slug,
    name,
    categoryId: category.id,
    attributeId: attribute.id,
    attributeName: "Pointure",
    products,
  };
}

/**
 * Supprime la boutique et toutes ses données.
 * Suppression explicite et ordonnée : reservation_items → products est en
 * ON DELETE RESTRICT, on ne peut pas se reposer sur la seule cascade du shop.
 */
export async function cleanupTestShop(slug: string): Promise<void> {
  const supabase = adminClient();

  const { data: shop } = await supabase
    .from("shops")
    .select("id")
    .eq("slug", slug)
    .maybeSingle<IdRow>();

  if (!shop) return;

  await supabase.from("reservations").delete().eq("shop_id", shop.id);
  await supabase.from("packs").delete().eq("shop_id", shop.id);
  await supabase.from("products").delete().eq("shop_id", shop.id);
  await supabase.from("categories").delete().eq("shop_id", shop.id);
  await supabase.from("shop_websites").delete().eq("shop_id", shop.id);
  await supabase.from("shops").delete().eq("id", shop.id);
}

/**
 * Crée une réservation bloquante directement via la fonction Postgres
 * (même chemin que le tunnel), sans passer par l'UI.
 */
export async function createBlockingReservation(params: {
  shopId: string;
  productId: string;
  quantity: number;
  startDate: string;
  endDate: string;
}): Promise<string> {
  const supabase = adminClient();

  const { data, error } = await supabase.rpc("create_web_reservation", {
    p_shop_id: params.shopId,
    p_customer_name: "Client bloquant e2e",
    p_customer_email: "blocage@example.test",
    p_customer_phone: null,
    p_start_date: params.startDate,
    p_end_date: params.endDate,
    p_items: [
      { product_id: params.productId, pack_id: null, quantity: params.quantity },
    ],
    p_participant_values: [],
  });

  if (error || typeof data !== "string") {
    throw new Error(
      `Seed e2e — réservation bloquante : ${error?.message ?? "id manquant"}`,
    );
  }

  return data;
}

// ── Lectures de vérification (assertions base de données) ────────────

export type ReservationRow = {
  id: string;
  source: string;
  status: string;
  total_price: number;
  start_date: string;
  end_date: string;
  customer_name: string;
  customer_email: string | null;
};

export async function findReservationByEmail(
  shopId: string,
  email: string,
): Promise<ReservationRow | null> {
  const { data } = await adminClient()
    .from("reservations")
    .select(
      "id, source, status, total_price, start_date, end_date, customer_name, customer_email",
    )
    .eq("shop_id", shopId)
    .eq("customer_email", email)
    .maybeSingle<ReservationRow>();

  return data ?? null;
}

export type ReservationItemRow = {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
};

export async function findReservationItems(
  reservationId: string,
): Promise<ReservationItemRow[]> {
  const { data } = await adminClient()
    .from("reservation_items")
    .select("id, product_id, quantity, unit_price")
    .eq("reservation_id", reservationId)
    .returns<ReservationItemRow[]>();

  return data ?? [];
}

export async function countUnitAssignments(
  reservationItemId: string,
): Promise<number> {
  const { count } = await adminClient()
    .from("reservation_unit_assignments")
    .select("id", { count: "exact", head: true })
    .eq("reservation_item_id", reservationItemId);

  return count ?? 0;
}

export type ParticipantValueRow = {
  value: string | null;
  participant_index: number;
  category_attribute_id: string;
};

export async function findParticipantValues(
  reservationItemId: string,
): Promise<ParticipantValueRow[]> {
  const { data } = await adminClient()
    .from("participant_attribute_values")
    .select("value, participant_index, category_attribute_id")
    .eq("reservation_item_id", reservationItemId)
    .returns<ParticipantValueRow[]>();

  return data ?? [];
}
