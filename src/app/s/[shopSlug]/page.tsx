import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import { connection } from "next/server";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ shopSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { shopSlug } = await params;
  const supabase = await createClient();

  const { data: shop } = await supabase
    .from("shops")
    .select("name, email")
    .eq("slug", shopSlug)
    .single();

  if (!shop) return { title: "Boutique introuvable" };

  return {
    title: shop.name,
    description: `Location de matériel sportif chez ${shop.name}`,
  };
}

export default async function ShopPage({ params }: Props) {
  await connection();
  const { shopSlug } = await params;
  const supabase = await createClient();

  const { data: shop } = await supabase
    .from("shops")
    .select("id, name, slug, email, phone, address")
    .eq("slug", shopSlug)
    .single();

  if (!shop) notFound();

  const { data: website } = await supabase
    .from("shop_websites")
    .select("*")
    .eq("shop_id", shop.id)
    .eq("is_published", true)
    .single();

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, type")
    .eq("shop_id", shop.id)
    .order("position");

  const { data: products } = await supabase
    .from("products")
    .select("id, name, description, price_web, image_url, category_id, brand_id")
    .eq("shop_id", shop.id);

  const { data: packs } = await supabase
    .from("packs")
    .select("id, name, description, image_url")
    .eq("shop_id", shop.id);

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="flex flex-col items-center gap-4 px-4 py-16 text-center">
        <h1 className="text-display text-primary">
          {website?.hero_title || shop.name}
        </h1>
        {website?.hero_subtitle && (
          <p className="max-w-2xl text-lg text-muted-foreground">
            {website.hero_subtitle}
          </p>
        )}
      </section>

      {/* Catalogue */}
      <section className="mx-auto max-w-6xl px-4 py-8">
        <h2 className="mb-6 text-h2">Catalogue</h2>
        {categories && categories.length > 0 ? (
          <div className="space-y-8">
            {categories.map((cat) => (
              <div key={cat.id}>
                <h3 className="mb-4 text-h3">{cat.name}</h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {products
                    ?.filter((p) => p.category_id === cat.id)
                    .map((product) => (
                      <div
                        key={product.id}
                        className="rounded-lg border bg-card p-4 shadow-sm"
                      >
                        <h4 className="font-semibold">{product.name}</h4>
                        {product.description && (
                          <p className="mt-1 text-body-sm text-muted-foreground">
                            {product.description}
                          </p>
                        )}
                        <p className="mt-2 text-lg font-bold tabular-nums text-primary">
                          {(product.price_web / 100).toFixed(2)} €
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">Aucun produit disponible.</p>
        )}

        {packs && packs.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-6 text-h2">Packs</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {packs.map((pack) => (
                <div
                  key={pack.id}
                  className="rounded-lg border bg-card p-4 shadow-sm"
                >
                  <span className="mb-2 inline-block rounded-md bg-primary/10 px-2 py-0.5 text-caption font-medium text-primary">
                    Pack
                  </span>
                  <h4 className="font-semibold">{pack.name}</h4>
                  {pack.description && (
                    <p className="mt-1 text-body-sm text-muted-foreground">
                      {pack.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t px-4 py-8 text-center text-body-sm text-muted-foreground">
        <p>{shop.name}</p>
        {shop.address && <p>{shop.address}</p>}
        {shop.phone && <p>{shop.phone}</p>}
      </footer>
    </main>
  );
}
