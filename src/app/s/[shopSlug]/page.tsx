import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { Package } from "lucide-react";

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
    .select("id, name, slug, email, phone, address, logo_url")
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
      <section className="relative overflow-hidden px-4 py-16">
        {website?.hero_image_url && (
          <>
            <Image
              src={website.hero_image_url}
              alt=""
              fill
              sizes="100vw"
              priority
              className="object-cover"
            />
            {/* Voile pour garantir la lisibilité du texte sur l'image */}
            <div
              className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/70 to-background"
              aria-hidden
            />
          </>
        )}
        <div className="relative flex flex-col items-center gap-4 text-center">
          {shop.logo_url && (
            <span className="relative block h-16 w-16 overflow-hidden rounded-full border bg-card shadow-sm">
              <Image
                src={shop.logo_url}
                alt={`Logo ${shop.name}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </span>
          )}
          <h1 className="text-display text-primary">
            {website?.hero_title || shop.name}
          </h1>
          {website?.hero_subtitle && (
            <p className="max-w-2xl text-lg text-muted-foreground">
              {website.hero_subtitle}
            </p>
          )}
          {website && (
            <Link
              href={`/s/${shop.slug}/reserver`}
              className={buttonVariants({ size: "lg" })}
            >
              Réserver en ligne
            </Link>
          )}
        </div>
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
                        className="overflow-hidden rounded-lg border bg-card shadow-sm"
                      >
                        <div className="relative aspect-[4/3] bg-secondary">
                          {product.image_url ? (
                            <Image
                              src={product.image_url}
                              alt={product.name}
                              fill
                              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <Package
                                className="size-8 text-muted-foreground"
                                aria-hidden
                              />
                            </div>
                          )}
                        </div>
                        <div className="p-4">
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
                  className="overflow-hidden rounded-lg border bg-card shadow-sm"
                >
                  <div className="relative aspect-[4/3] bg-secondary">
                    {pack.image_url ? (
                      <Image
                        src={pack.image_url}
                        alt={pack.name}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Package
                          className="size-8 text-muted-foreground"
                          aria-hidden
                        />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
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
