import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CatalogToolbar } from "@/features/catalog/components/catalog-toolbar";
import { createClient } from "@/lib/supabase/server";
import { Package } from "lucide-react";

export default async function CatalogPage() {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, type, position")
    .order("position");

  const { data: products } = await supabase
    .from("products")
    .select("id, name, price_web, price_shop, category_id, image_url");

  const { data: brands } = await supabase.from("brands").select("id, name");

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-h1">Catalogue</h1>
          <p className="mt-1 text-body-sm text-muted-foreground">
            Gérez vos catégories, produits et marques
          </p>
        </div>
        <CatalogToolbar
          categories={(categories ?? []).map((c) => ({ id: c.id, name: c.name }))}
          brands={brands ?? []}
        />
      </header>

      {/* Categories */}
      {!categories || categories.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Package className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-h3">Aucune catégorie</h2>
            <p className="mt-1 text-body-sm text-muted-foreground">
              Créez votre première catégorie pour commencer
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {categories.map((category) => {
            const categoryProducts = products?.filter(
              (p) => p.category_id === category.id,
            );

            return (
              <Card key={category.id}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-h3">{category.name}</CardTitle>
                    <Badge variant="secondary" className="text-caption">
                      {category.type === "participant"
                        ? "Participant"
                        : "Produit"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="tabular-nums">
                      {categoryProducts?.length ?? 0} produit
                      {(categoryProducts?.length ?? 0) > 1 ? "s" : ""}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {!categoryProducts || categoryProducts.length === 0 ? (
                    <p className="py-4 text-center text-body-sm text-muted-foreground">
                      Aucun produit dans cette catégorie
                    </p>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {categoryProducts.map((product) => (
                        <div
                          key={product.id}
                          className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-secondary/30"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">
                              {product.name}
                            </p>
                            <div className="mt-0.5 flex gap-3 text-caption text-muted-foreground">
                              <span className="tabular-nums">
                                Web: {(product.price_web / 100).toFixed(0)} €
                              </span>
                              <span className="tabular-nums">
                                Mag: {(product.price_shop / 100).toFixed(0)} €
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
