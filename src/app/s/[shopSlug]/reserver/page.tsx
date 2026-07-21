import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Metadata } from "next";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { BookingTunnel } from "@/features/tunnel/components/booking-tunnel";
import type {
  TunnelAttribute,
  TunnelCatalog,
  TunnelPack,
} from "@/features/tunnel/types";

type Props = { params: Promise<{ shopSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { shopSlug } = await params;
  const supabase = await createClient();
  const { data: shop } = await supabase
    .from("shops")
    .select("name")
    .eq("slug", shopSlug)
    .single();

  return { title: shop ? `Réserver — ${shop.name}` : "Boutique introuvable" };
}

export default async function ReserverPage({ params }: Props) {
  await connection();
  const { shopSlug } = await params;
  const supabase = await createClient();

  const { data: shop } = await supabase
    .from("shops")
    .select("id, name, slug")
    .eq("slug", shopSlug)
    .single();

  if (!shop) notFound();

  const { data: website } = await supabase
    .from("shop_websites")
    .select("cgv_content, is_published")
    .eq("shop_id", shop.id)
    .eq("is_published", true)
    .single();

  // Réservation en ligne réservée aux boutiques publiées (même règle que
  // la fonction create_web_reservation côté base)
  if (!website) notFound();

  // shop_stripe_accounts n'est pas lisible par l'anonyme (RLS) — on lit le
  // statut d'encaissement côté serveur avec le client admin, et on ne passe
  // qu'un booléen au client.
  const { data: stripeAccount } = await createAdminClient()
    .from("shop_stripe_accounts")
    .select("charges_enabled")
    .eq("shop_id", shop.id)
    .single();

  const [{ data: categories }, { data: products }, { data: attributes }, { data: packs }] =
    await Promise.all([
      supabase
        .from("categories")
        .select("id, name")
        .eq("shop_id", shop.id)
        .eq("type", "product")
        .order("position"),
      supabase
        .from("products")
        .select("id, name, description, price_web, category_id")
        .eq("shop_id", shop.id),
      supabase
        .from("category_attributes")
        .select("id, category_id, name, format, options, required")
        .eq("scope", "participant"),
      supabase
        .from("packs")
        .select("id, name, description, pack_items(product_id, is_required, price_web_override)")
        .eq("shop_id", shop.id),
    ]);

  const catalog: TunnelCatalog = {
    shopId: shop.id,
    shopSlug: shop.slug,
    shopName: shop.name,
    hasCgv: Boolean(website.cgv_content),
    onlinePayment: Boolean(stripeAccount?.charges_enabled),
    categories: categories ?? [],
    products: products ?? [],
    // RLS limite déjà les attributs aux shops publics ; on filtre par
    // sécurité sur les catégories du shop
    participantAttributes: ((attributes ?? []) as TunnelAttribute[]).filter((a) =>
      (categories ?? []).some((c) => c.id === a.category_id),
    ),
    packs: (packs ?? []).map(
      (p): TunnelPack => ({
        id: p.id,
        name: p.name,
        description: p.description,
        items: p.pack_items ?? [],
      }),
    ),
  };

  return (
    <main className="min-h-screen bg-background">
      <BookingTunnel catalog={catalog} />
    </main>
  );
}
