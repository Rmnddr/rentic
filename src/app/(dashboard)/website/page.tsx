import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { Globe } from "lucide-react";

export default async function WebsitePage() {
  const supabase = await createClient();
  const shopId = (await supabase.rpc("get_user_shop_id")).data;

  const { data: website } = await supabase
    .from("shop_websites")
    .select("*")
    .eq("shop_id", shopId ?? "")
    .single();

  const { data: shop } = await supabase
    .from("shops")
    .select("slug")
    .eq("id", shopId ?? "")
    .single();

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-h1">Site Web</h1>
          <p className="mt-1 text-body-sm text-muted-foreground">
            Configurez votre vitrine en ligne
          </p>
        </div>
        {website?.is_published && shop?.slug && (
          <Badge variant="default" className="gap-1.5">
            <Globe className="h-3 w-3" />
            Publié
          </Badge>
        )}
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-h3">Landing page</CardTitle>
          <CardDescription>
            Personnalisez le hero, les sections et les informations affichées
          </CardDescription>
        </CardHeader>
        <CardContent>
          {website ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-secondary/50 p-4">
                <p className="text-body-sm text-muted-foreground">Titre hero</p>
                <p className="mt-1 font-medium">
                  {website.hero_title || "Non défini"}
                </p>
              </div>
              <div className="rounded-lg bg-secondary/50 p-4">
                <p className="text-body-sm text-muted-foreground">Sous-titre</p>
                <p className="mt-1 font-medium">
                  {website.hero_subtitle || "Non défini"}
                </p>
              </div>
              {shop?.slug && (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <p className="text-body-sm text-muted-foreground">
                    URL publique
                  </p>
                  <p className="mt-1 font-medium text-primary">
                    {process.env.NEXT_PUBLIC_APP_URL}/s/{shop.slug}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Globe className="h-7 w-7 text-primary" />
              </div>
              <p className="text-body-sm text-muted-foreground">
                Aucun site configuré — commencez par éditer votre landing page
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
