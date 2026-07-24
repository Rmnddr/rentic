import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { ArrowRight, Package } from "lucide-react";

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

  const hasHero = Boolean(website?.hero_image_url);
  const reserveHref = `/s/${shop.slug}/reserver`;

  return (
    <main className="min-h-screen bg-background pb-24">
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <div className="relative flex min-h-[420px] flex-col items-center justify-center overflow-hidden rounded-[32px] p-8 text-center shadow-organic">
          {hasHero ? (
            <>
              <Image
                src={website!.hero_image_url!}
                alt=""
                fill
                sizes="100vw"
                priority
                className="object-cover"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20"
                aria-hidden
              />
            </>
          ) : (
            <div
              className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-accent/10"
              aria-hidden
            />
          )}

          <div className="relative z-10 flex max-w-2xl flex-col items-center gap-6">
            {shop.logo_url ? (
              <span className="relative block h-20 w-20 overflow-hidden rounded-full border-4 border-surface shadow-lg">
                <Image
                  src={shop.logo_url}
                  alt={`Logo ${shop.name}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </span>
            ) : (
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-surface shadow-organic">
                <Package className="h-10 w-10 text-primary" aria-hidden />
              </span>
            )}

            <div className="space-y-2">
              <h1
                className={`text-4xl font-bold tracking-tight sm:text-5xl ${
                  hasHero ? "text-white" : "text-foreground"
                }`}
              >
                {website?.hero_title || shop.name}
              </h1>
              {website?.hero_subtitle && (
                <p
                  className={`text-lg ${
                    hasHero ? "text-white/90" : "text-muted-foreground"
                  }`}
                >
                  {website.hero_subtitle}
                </p>
              )}
            </div>

            {website && (
              <Link
                href={reserveHref}
                className="mt-2 flex items-center gap-2 rounded-[16px] bg-accent px-8 py-4 text-lg font-bold text-accent-foreground shadow-organic transition-transform hover:-translate-y-1 hover:shadow-organic-hover"
              >
                Réserver en ligne
                <ArrowRight className="h-5 w-5" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Catalogue */}
      <section className="mx-auto mt-16 max-w-7xl space-y-16 px-4 sm:px-6 lg:px-8">
        {categories && categories.length > 0 ? (
          categories.map((cat) => {
            const catProducts = products?.filter(
              (p) => p.category_id === cat.id,
            );
            if (!catProducts || catProducts.length === 0) return null;
            return (
              <section key={cat.id}>
                <h2 className="mb-8 text-2xl font-bold text-foreground">
                  {cat.name}
                </h2>
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {catProducts.map((product) => (
                    <div
                      key={product.id}
                      className="group overflow-hidden rounded-[24px] bg-surface shadow-organic transition-transform hover:-translate-y-1"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                        {product.image_url ? (
                          <Image
                            src={product.image_url}
                            alt={product.name}
                            fill
                            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Package
                              className="h-16 w-16 text-muted-foreground/30"
                              aria-hidden
                            />
                          </div>
                        )}
                      </div>
                      <div className="space-y-4 p-6">
                        <div>
                          <h3 className="text-xl font-bold text-foreground">
                            {product.name}
                          </h3>
                          {product.description && (
                            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                              {product.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-end justify-between border-t border-muted pt-4">
                          <span className="text-2xl font-bold tabular-nums text-foreground">
                            {(product.price_web / 100).toLocaleString("fr-FR", {
                              minimumFractionDigits: 2,
                            })}{" "}
                            €
                          </span>
                          <Link
                            href={reserveHref}
                            className="rounded-[12px] bg-primary/10 px-5 py-2.5 text-sm font-bold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                          >
                            Choisir
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })
        ) : (
          <p className="text-muted-foreground">Aucun produit disponible.</p>
        )}

        {packs && packs.length > 0 && (
          <section>
            <h2 className="mb-8 text-2xl font-bold text-foreground">
              Nos packs
            </h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {packs.map((pack) => (
                <div
                  key={pack.id}
                  className="group overflow-hidden rounded-[24px] bg-surface shadow-organic transition-transform hover:-translate-y-1"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    {pack.image_url ? (
                      <Image
                        src={pack.image_url}
                        alt={pack.name}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Package
                          className="h-16 w-16 text-muted-foreground/30"
                          aria-hidden
                        />
                      </div>
                    )}
                    <span className="absolute left-4 top-4 rounded-full bg-accent px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-accent-foreground shadow-sm">
                      Pack
                    </span>
                  </div>
                  <div className="space-y-4 p-6">
                    <div>
                      <h3 className="text-xl font-bold text-foreground">
                        {pack.name}
                      </h3>
                      {pack.description && (
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                          {pack.description}
                        </p>
                      )}
                    </div>
                    {website && (
                      <div className="flex justify-end border-t border-muted pt-4">
                        <Link
                          href={reserveHref}
                          className="rounded-[12px] bg-primary/10 px-5 py-2.5 text-sm font-bold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                        >
                          Choisir
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </section>

      {/* Footer */}
      <footer className="mx-auto mt-24 max-w-7xl px-4 text-center text-sm text-muted-foreground sm:px-6 lg:px-8">
        <div className="border-t border-muted pt-8">
          <p className="font-semibold text-foreground">{shop.name}</p>
          {shop.address && <p className="mt-1">{shop.address}</p>}
          {shop.phone && <p>{shop.phone}</p>}
        </div>
      </footer>
    </main>
  );
}
