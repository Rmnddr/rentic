import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { Layers } from "lucide-react";

export default async function PacksPage() {
  const supabase = await createClient();

  const { data: packs } = await supabase
    .from("packs")
    .select("id, name, description, image_url")
    .order("created_at", { ascending: false });

  const { data: packItems } = await supabase
    .from("pack_items")
    .select("id, pack_id, product_id, is_required, price_web_override, price_shop_override");

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-h1">Packs</h1>
        <p className="mt-1 text-body-sm text-muted-foreground">
          Créez des offres groupées attractives
        </p>
      </header>

      {!packs || packs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Layers className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-h3">Aucun pack</h2>
            <p className="mt-1 text-body-sm text-muted-foreground">
              Créez votre premier pack pour proposer des offres groupées
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {packs.map((pack) => {
            const items = packItems?.filter((i) => i.pack_id === pack.id) ?? [];
            const requiredCount = items.filter((i) => i.is_required).length;
            const optionalCount = items.filter((i) => !i.is_required).length;

            return (
              <Card
                key={pack.id}
                className="transition-shadow hover:shadow-hover"
              >
                <CardContent className="pt-6">
                  <div className="mb-3 flex items-start justify-between">
                    <h3 className="text-h3">{pack.name}</h3>
                    <Badge variant="secondary" className="tabular-nums">
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
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
