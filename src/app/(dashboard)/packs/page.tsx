import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DeletePackButton } from "@/features/packs/components/delete-pack-button";
import {
  PackFormDialog,
  type PackProduct,
} from "@/features/packs/components/pack-form-dialog";
import { createClient } from "@/lib/supabase/server";
import { Layers } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default async function PacksPage() {
  const supabase = await createClient();

  const { data: packs } = await supabase
    .from("packs")
    .select("id, name, description, image_url")
    .order("created_at", { ascending: false });

  const { data: packItems } = await supabase
    .from("pack_items")
    .select(
      "id, pack_id, product_id, is_required, price_web_override, price_shop_override, position",
    )
    .order("position");

  const { data: productRows } = await supabase
    .from("products")
    .select("id, name, price_web, price_shop")
    .order("name");

  const products: PackProduct[] = (productRows ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    priceWeb: p.price_web,
    priceShop: p.price_shop,
  }));

  // Un pack exige au moins 2 produits : sans catalogue suffisant, on oriente
  // vers le catalogue plutôt que d'ouvrir un formulaire impossible à valider.
  const canCreate = products.length >= 2;

  function itemsOf(packId: string) {
    return (packItems ?? []).filter((i) => i.pack_id === packId);
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-h1">Packs</h1>
          <p className="mt-1 text-body-sm text-muted-foreground">
            Créez des offres groupées attractives
          </p>
        </div>
        {canCreate && <PackFormDialog products={products} />}
      </header>

      {!packs || packs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Layers className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-h3">Aucun pack</h2>
            {canCreate ? (
              <>
                <p className="mt-1 text-body-sm text-muted-foreground">
                  Créez votre premier pack pour proposer des offres groupées
                </p>
                <div className="mt-4">
                  <PackFormDialog products={products} />
                </div>
              </>
            ) : (
              <p className="mt-1 text-body-sm text-muted-foreground">
                Ajoutez au moins 2 produits à votre{" "}
                <Link href="/catalog" className="underline">
                  catalogue
                </Link>{" "}
                pour composer un pack
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {packs.map((pack) => {
            const items = itemsOf(pack.id);
            const requiredCount = items.filter((i) => i.is_required).length;
            const optionalCount = items.filter((i) => !i.is_required).length;

            return (
              <Card
                key={pack.id}
                className="transition-shadow hover:shadow-hover"
              >
                <CardContent className="pt-6">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-secondary">
                        {pack.image_url ? (
                          <Image
                            src={pack.image_url}
                            alt={pack.name}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Layers
                              className="size-5 text-muted-foreground"
                              aria-hidden
                            />
                          </div>
                        )}
                      </div>
                      <h3 className="text-h3 line-clamp-2">{pack.name}</h3>
                    </div>
                    <Badge
                      variant="secondary"
                      className="shrink-0 tabular-nums whitespace-nowrap"
                    >
                      {items.length} item{items.length > 1 ? "s" : ""}
                    </Badge>
                  </div>
                  {pack.description && (
                    <p className="mb-3 text-body-sm text-muted-foreground line-clamp-2">
                      {pack.description}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Badge variant="default" className="text-[10px]">
                      {requiredCount} obligatoire{requiredCount > 1 ? "s" : ""}
                    </Badge>
                    {optionalCount > 0 && (
                      <Badge variant="outline" className="text-[10px]">
                        {optionalCount} optionnel{optionalCount > 1 ? "s" : ""}
                      </Badge>
                    )}
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t pt-3">
                    <PackFormDialog
                      products={products}
                      pack={{
                        id: pack.id,
                        name: pack.name,
                        description: pack.description ?? "",
                        imageUrl: pack.image_url ?? "",
                        items: items.map((i) => ({
                          productId: i.product_id,
                          isRequired: i.is_required,
                          priceWebOverride: i.price_web_override,
                          priceShopOverride: i.price_shop_override,
                        })),
                      }}
                    />
                    <DeletePackButton id={pack.id} name={pack.name} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
